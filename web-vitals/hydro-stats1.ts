import {sendEvent, stringifyObjectValues} from '@github-ui/hydro-analytics'
import {getEnabledFeatures, isFeatureEnabled} from '@github-ui/feature-flags'
import {loaded} from '@github-ui/document-ready'
import type {WebVitalMetric, MetricOrHPC} from './web-vitals'
import type {HPCTimingEvent} from './hpc-events'
import {getCPUBucket} from '@github-ui/cpu-bucket'
import type {INPAttribution} from './inp/metric'

interface WebVitalInformation {
  name: string
  value: number
  element?: string
  events?: string
  interactionType?: string
  eventType?: string
  inputDelay?: number
  processingDuration?: number
  presentationDelay?: number
}

interface HPCInformation extends WebVitalInformation {
  mechanism: HPCTimingEvent['mechanism']
  soft: boolean
}

interface HydroStat {
  react?: boolean
  reactApp?: string | null
  reactPartials?: string[]
  featureFlags?: string[]
  ssr?: boolean
  hpc?: HPCInformation
  ttfb?: WebVitalInformation
  fcp?: WebVitalInformation
  lcp?: WebVitalInformation
  fid?: WebVitalInformation
  inp?: WebVitalInformation
  cls?: WebVitalInformation
  elementtiming?: WebVitalInformation
  longTasks?: PerformanceEntryList
  longAnimationFrames?: PerformanceEntryList
  controller?: string
  action?: string
  routePattern?: string
  cpu?: string
  domNodes?: number
  previousDomNodes?: number
}

let queued: HydroStat | undefined

/**
 * Batched report of vital to hydro
 */
export function sendToHydro({
  metric,
  ssr,
  domNodes,
  previousDomNodes,
  longTasks,
  longAnimationFrames,
}: {
  metric?: MetricOrHPC
  ssr: boolean
  domNodes?: number
  previousDomNodes?: number
  longTasks?: PerformanceEntryList
  longAnimationFrames?: PerformanceEntryList
}) {
  let hydroStat: HydroStat | undefined
  if (isFeatureEnabled('report_hydro_web_vitals')) return

  if (!hydroStat) {
    const reactApp = document.querySelector('react-app')
    hydroStat = queueStat()
    hydroStat.react = !!reactApp
    hydroStat.reactApp = reactApp?.getAttribute('app-name')
    // Convert to Set and back to Array to remove duplicates.
    hydroStat.reactPartials = [
      ...new Set(
        Array.from(document.querySelectorAll('react-partial')).map(
          partial => partial.getAttribute('partial-name') || '',
        ),
      ),
    ]
    hydroStat.featureFlags = getFeatureFlags()
    hydroStat.ssr = ssr
    hydroStat.controller = document.querySelector<HTMLMetaElement>('meta[name="route-controller"]')?.content
    hydroStat.action = document.querySelector<HTMLMetaElement>('meta[name="route-action"]')?.content
    hydroStat.routePattern = document.querySelector<HTMLMetaElement>('meta[name="route-pattern"]')?.content
    hydroStat.cpu = getCPUBucket()

    if (domNodes) hydroStat.domNodes = domNodes
    if (previousDomNodes) hydroStat.previousDomNodes = previousDomNodes
  }

  if (metric) {
    return sendWebVital(hydroStat, metric)
  }

  hydroStat.longTasks = longTasks
  hydroStat.longAnimationFrames = longAnimationFrames
}

interface ReactApp extends Element {
  enabledFeatures: string[]
}

function getFeatureFlags() {
  const globalFlags = getEnabledFeatures()
  const reactAppFlags = document.querySelector<ReactApp>('react-app')?.enabledFeatures || []
  // need to many to check for speculation_rules otherwise it will get minified away
  const speculationRulesFlag = isFeatureEnabled('speculation_rules') ? ['speculation_rules'] : []

  return Array.from(new Set([...globalFlags, ...reactAppFlags, ...speculationRulesFlag]))
}

function sendWebVital(hydroStat: HydroStat, metric: MetricOrHPC) {
  if (metric.value < 60_000) {
    if (metric.name === 'HPC') {
      hydroStat[metric.name.toLocaleLowerCase() as Lowercase<typeof metric.name>] = buildHPCInformation(metric)
    } else {
      hydroStat[metric.name.toLocaleLowerCase() as Lowercase<typeof metric.name>] = buildWebVitalInformation(metric)
    }
  }
}

function buildHPCInformation(metric: HPCTimingEvent): HPCInformation {
  return {
    name: metric.name,
    value: metric.value,
    element: metric.attribution?.element,
    soft: !!metric.soft,
    mechanism: metric.mechanism,
  }
}

function buildWebVitalInformation(metric: WebVitalMetric): WebVitalInformation {
  const vitalInformation: WebVitalInformation = {
    name: metric.name,
    value: metric.value,
  }

  switch (metric.name) {
    case 'LCP':
    case 'ElementTiming':
      vitalInformation.element = metric.attribution?.target
      break
    case 'INP':
      vitalInformation.element = metric.attribution?.interactionTarget
      // Only include custom fields if they exist (from our custom INPMetric class)
      if (metric.attribution && 'interactionType' in metric.attribution) {
        const customAttribution = metric.attribution as INPAttribution
        vitalInformation.interactionType = customAttribution.interactionType
        vitalInformation.eventType = customAttribution.eventType
        vitalInformation.inputDelay = customAttribution.inputDelay
        vitalInformation.processingDuration = customAttribution.processingDuration
        vitalInformation.presentationDelay = customAttribution.presentationDelay
      }
      if (metric.entries?.length) vitalInformation.events = metric.entries.map(entry => entry.name).join(',')
      break
    case 'CLS':
      vitalInformation.element = metric.attribution?.largestShiftTarget
      break
  }

  return vitalInformation
}

/**
 * Create a new stat object and schedule it to be sent to hydro
 */
function queueStat(): HydroStat {
  if (!queued) {
    queued = {}
    scheduleSend()
  }
  return queued
}

/**
 * Schedule a send to hydro
 */
async function scheduleSend() {
  await loaded
  // eslint-disable-next-line compat/compat
  window.requestIdleCallback(send)
}

/**
 * Send the queued event to hydro
 */
function send() {
  if (!queued) return

  sendEvent('web-vital', stringifyObjectValues(queued))
  queued = undefined
}
