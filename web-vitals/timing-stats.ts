import {isHeaderRedesign} from './web-vitals'
import type {MetricOrHPC} from './web-vitals'
import {loaded} from '@github-ui/document-ready'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {sendStats, sendCustomMetric} from '@github-ui/stats'
import {sendToHydro} from './hydro-stats'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import {MECHANISM_MAPPING} from '@github-ui/soft-nav/stats'
import {getCPUBucket} from '@github-ui/cpu-bucket'
import type {HPCTimingEvent} from './hpc-events'
import {getDomNodes} from './dom-nodes'
import type {INPAttribution} from './inp/metric'

type INPBottleneck = 'input_delay' | 'processing' | 'presentation'

/**
 * Determines the primary bottleneck phase for an INP interaction.
 * When phases have equal duration, precedence is: processing > input_delay > presentation
 * @returns The bottleneck phase identifier, or undefined if attribution data is incomplete
 */
function getBottleneck(attribution: INPAttribution | undefined): INPBottleneck | undefined {
  if (!attribution) return undefined
  const {inputDelay, processingDuration, presentationDelay} = attribution
  if (inputDelay === undefined || processingDuration === undefined || presentationDelay === undefined) {
    return undefined
  }

  if (processingDuration >= inputDelay && processingDuration >= presentationDelay) return 'processing'
  if (inputDelay >= presentationDelay) return 'input_delay'
  return 'presentation'
}

interface NetworkInformation extends EventTarget {
  readonly effectiveType: string
}

interface SendVitalsOptions {
  url?: string
}

export function sendVitals(metric: MetricOrHPC, opts: SendVitalsOptions = {}) {
  const {name, value} = metric
  const stat: PlatformBrowserPerformanceWebVitalTiming = {
    name: opts.url || window.location.href,
    cpu: getCPUBucket(),
  }
  stat[name.toLowerCase() as Lowercase<typeof name>] = value

  if (isFeatureEnabled('sample_network_conn_type')) {
    stat.networkConnType = getConnectionType()
  }

  if (name === 'ElementTiming') {
    stat.identifier = metric.identifier
  }

  if (name === 'HPC') {
    addHPCStats(stat, metric)
  }

  // For INP, we make one sampling decision and apply it to both phase metrics
  // and webVitalTimings so they are always sent together or not at all.
  // For other metrics, use default sampling (0.5).
  let inpSampled: boolean | undefined

  if (name === 'INP' && 'interactionType' in (metric.attribution || {})) {
    // Make one sampling decision for all INP-related stats
    inpSampled = Math.random() < 0.5

    // Only set custom fields if they exist (from our custom INPMetric class)
    const attribution = metric.attribution as INPAttribution | undefined
    stat.inpInteractionType = attribution?.interactionType
    stat.inpEventType = attribution?.eventType
    stat.inpBottleneck = getBottleneck(attribution)

    // Get DOM node counts once for both stat and custom metrics
    const domNodeCounts = isFeatureEnabled('dom_node_counts')
      ? getDomNodes()
      : {current: undefined, previous: undefined}

    // Set domNodes on stat for INP (will be skipped in later section due to already being set)
    if (domNodeCounts.current !== undefined) {
      stat.domNodes = domNodeCounts.current
    }
    if (domNodeCounts.previous !== undefined) {
      stat.previousDomNodes = domNodeCounts.previous
    }

    // Send separate phase duration metrics using customMetrics (only if sampled)
    // Tags: app_name, ssr, cpu, domNodes, previousDomNodes, url
    if (inpSampled) {
      const phaseTags: Record<string, string | number> = {
        cpu: getCPUBucket(),
      }
      if (domNodeCounts.current !== undefined) {
        phaseTags.domNodes = domNodeCounts.current
      }
      if (domNodeCounts.previous !== undefined) {
        phaseTags.previousDomNodes = domNodeCounts.previous
      }

      if (attribution?.inputDelay !== undefined) {
        sendCustomMetric(
          {
            name: 'BROWSER_VITALS_DIST_INP_INPUT_DELAY',
            value: attribution.inputDelay,
            tags: phaseTags,
            requestUrl: opts.url,
          },
          false,
          1, // Already sampled above
        )
      }
      if (attribution?.processingDuration !== undefined) {
        sendCustomMetric(
          {
            name: 'BROWSER_VITALS_DIST_INP_PROCESSING',
            value: attribution.processingDuration,
            tags: phaseTags,
            requestUrl: opts.url,
          },
          false,
          1, // Already sampled above
        )
      }
      if (attribution?.presentationDelay !== undefined) {
        sendCustomMetric(
          {
            name: 'BROWSER_VITALS_DIST_INP_PRESENTATION',
            value: attribution.presentationDelay,
            tags: phaseTags,
            requestUrl: opts.url,
          },
          false,
          1, // Already sampled above
        )
      }
    }
  }

  // Only get domNodes for HPC here, INP already handled above
  if (isFeatureEnabled('dom_node_counts') && name === 'HPC') {
    const domNodeCounts = getDomNodes()
    stat.domNodes = domNodeCounts.current
    stat.previousDomNodes = domNodeCounts.previous
  }

  const syntheticTest = document.querySelector('meta[name="synthetic-test"]')
  if (syntheticTest) {
    stat.synthetic = true
  }

  emitEvent(name, stat)

  // For INP, use the pre-determined sampling decision to ensure phase metrics
  // and webVitalTimings are always sent together. For other metrics, use default sampling.
  const samplingProbability = inpSampled !== undefined ? (inpSampled ? 1 : 0) : undefined
  sendStats({webVitalTimings: [stat]}, false, samplingProbability)

  sendToHydro({metric, ssr: !!stat.ssr, domNodes: stat.domNodes, previousDomNodes: stat.previousDomNodes})

  updateStaffBar(name, value)
}

function emitEvent(name: string, stat: PlatformBrowserPerformanceWebVitalTiming) {
  const eventName = `web-vitals:${name.toLowerCase()}`
  ssrSafeDocument?.dispatchEvent(new CustomEvent(eventName, {detail: stat}))
}

const addHPCStats = (stat: PlatformBrowserPerformanceWebVitalTiming, metric: HPCTimingEvent) => {
  stat.soft = metric.soft
  stat.ssr = metric.ssr
  stat.mechanism = MECHANISM_MAPPING[metric.mechanism]
  stat.lazy = metric.lazy
  stat.alternate = metric.alternate
  stat.hpcFound = metric.found
  stat.hpcGqlFetched = metric.gqlFetched
  stat.hpcJsFetched = metric.jsFetched
  stat.headerRedesign = isHeaderRedesign()
  stat.app = metric.app
}

function updateStaffBar(name: string, value: number) {
  const staffBarContainer = document.querySelector('#staff-bar-web-vitals')
  const metricContainer = staffBarContainer?.querySelector(`[data-metric=${name.toLowerCase()}]`)

  if (!metricContainer) {
    return
  }

  metricContainer.textContent = value.toPrecision(6)
}

function isTimingSuppported(): boolean {
  return !!(window.performance && window.performance.timing && window.performance.getEntriesByType)
}

function getConnectionType() {
  if (
    'connection' in navigator &&
    navigator.connection &&
    'effectiveType' in (navigator.connection as NetworkInformation)
  ) {
    return (navigator.connection as NetworkInformation).effectiveType
  }

  return 'N/A'
}

export async function sendTimingResults() {
  if (!isTimingSuppported()) return

  await loaded
  await new Promise(resolve => setTimeout(resolve))

  sendResourceTimings()
  sendNavigationTimings()
}

const sendResourceTimings = () => {
  const resourceTimings = window.performance.getEntriesByType('resource').map(
    (timing): PlatformBrowserPerformanceNavigationTiming => ({
      name: timing.name,
      entryType: timing.entryType,
      startTime: timing.startTime,
      duration: timing.duration,
      initiatorType: timing.initiatorType,
      nextHopProtocol: timing.nextHopProtocol,
      workerStart: timing.workerStart,
      redirectStart: timing.redirectStart,
      redirectEnd: timing.redirectEnd,
      fetchStart: timing.fetchStart,
      domainLookupStart: timing.domainLookupStart,
      domainLookupEnd: timing.domainLookupEnd,
      connectStart: timing.connectStart,
      connectEnd: timing.connectEnd,
      secureConnectionStart: timing.secureConnectionStart,
      requestStart: timing.requestStart,
      responseStart: timing.responseStart,
      responseEnd: timing.responseEnd,
      transferSize: timing.transferSize,
      encodedBodySize: timing.encodedBodySize,
      decodedBodySize: timing.decodedBodySize,
    }),
  )

  if (resourceTimings.length) {
    sendStats({resourceTimings}, false, 0.05)
  }
}

const sendNavigationTimings = () => {
  const navigationTimings = window.performance.getEntriesByType('navigation').map(
    (timing): PlatformBrowserPerformanceNavigationTiming => ({
      activationStart: timing.activationStart,
      name: timing.name,
      entryType: timing.entryType,
      startTime: timing.startTime,
      duration: timing.duration,
      initiatorType: timing.initiatorType,
      nextHopProtocol: timing.nextHopProtocol,
      workerStart: timing.workerStart,
      redirectStart: timing.redirectStart,
      redirectEnd: timing.redirectEnd,
      fetchStart: timing.fetchStart,
      domainLookupStart: timing.domainLookupStart,
      domainLookupEnd: timing.domainLookupEnd,
      connectStart: timing.connectStart,
      connectEnd: timing.connectEnd,
      secureConnectionStart: timing.secureConnectionStart,
      requestStart: timing.requestStart,
      responseStart: timing.responseStart,
      responseEnd: timing.responseEnd,
      transferSize: timing.transferSize,
      encodedBodySize: timing.encodedBodySize,
      decodedBodySize: timing.decodedBodySize,
      unloadEventStart: timing.unloadEventStart,
      unloadEventEnd: timing.unloadEventEnd,
      domInteractive: timing.domInteractive,
      domContentLoadedEventStart: timing.domContentLoadedEventStart,
      domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
      domComplete: timing.domComplete,
      loadEventStart: timing.loadEventStart,
      loadEventEnd: timing.loadEventEnd,
      type: timing.type,
      redirectCount: timing.redirectCount,
    }),
  )

  if (navigationTimings.length) {
    sendStats({navigationTimings}, false, isDevelopment() ? 1 : 0.05)
  }
}

function isDevelopment() {
  if (typeof process === 'undefined') return false

  return process.env.APP_NAME === 'development'
}
