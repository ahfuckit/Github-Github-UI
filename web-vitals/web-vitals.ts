import type {
  CLSMetricWithAttribution,
  FCPMetricWithAttribution,
  INPMetricWithAttribution,
  LCPMetricWithAttribution,
  TTFBMetricWithAttribution,
} from 'web-vitals/attribution'
import type {HPCTimingEvent} from './hpc-events'
import type {INPMetric} from './inp/metric'
import type {ElementTimingMetric} from './element-timing/metric'
import type {CLSMetric} from './cls/metric'
import type {INPObserver} from './inp/observer'
import {isFeatureEnabled} from '@github-ui/feature-flags'

// eslint-disable-next-line no-barrel-files/no-barrel-files
export {initMemorySampling} from './memory-sampling'

export type WebVitalMetric =
  | CLSMetricWithAttribution
  | FCPMetricWithAttribution
  | INPMetricWithAttribution
  | LCPMetricWithAttribution
  | TTFBMetricWithAttribution
  | INPMetric
  | CLSMetric
  | ElementTimingMetric

export type SoftWebVitalMetric =
  | CLSMetricWithAttribution
  | FCPMetricWithAttribution
  | INPMetricWithAttribution
  | LCPMetricWithAttribution
  | TTFBMetricWithAttribution

export type MetricOrHPC = WebVitalMetric | HPCTimingEvent

export function isReactLazyPayload() {
  return Boolean(document.querySelector('react-app[data-lazy="true"]'))
}

export function isReactAlternate() {
  return Boolean(document.querySelector('react-app[data-alternate="true"]'))
}

export function isHeaderRedesign() {
  return Boolean(document.querySelector('header.AppHeader'))
}

export function hasFetchedGQL(): boolean {
  return performance.getEntriesByType('resource').some(e => e.initiatorType === 'fetch' && e.name.includes('_graphql?'))
}

export function hasFetchedJS(): boolean {
  return performance.getEntriesByType('resource').some(e => e.initiatorType === 'script')
}

let inpObserver: INPObserver | null = null

export function getGlobalINPObserver(): INPObserver | null {
  return inpObserver
}

export function setGlobalINPObserver(observer: INPObserver) {
  inpObserver = observer
}

export function isSpeculationRulesEnabled(): boolean {
  return isFeatureEnabled('speculation_rules')
}
