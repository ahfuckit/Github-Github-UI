import {ssrSafeDocument} from '@github-ui/ssr-utils'
import type {BaseProcessor} from './processor'
import type {BaseMetric} from './metric'

type ObserverCallback<MetricType> = (metric: MetricType, opts: {url?: string}) => void

/*
 * The CLSObserver is responsible for listening to Performance events and routing them to the entryProcessor.
 * It also manages resetting CLS and reporting it when navigating or hiding a page.
 */
export abstract class BaseObserver<MetricType extends BaseMetric<unknown, unknown>, EntryType> {
  cb: ObserverCallback<MetricType>
  entryProcessor: BaseProcessor<MetricType, EntryType>
  observer?: PerformanceObserver
  url?: string

  constructor(cb: ObserverCallback<MetricType>) {
    this.cb = cb
    this.entryProcessor = this.initializeProcessor()
    this.setupListeners()
  }

  abstract initializeProcessor(): BaseProcessor<MetricType, EntryType>
  abstract get supported(): boolean
  abstract get softNavEventToListen(): string

  setupListeners() {
    if (!this.supported) return

    const onHiddenOrPageHide = (event: Event) => {
      if (event.type === 'pagehide' || document.visibilityState === 'hidden') {
        this.report()
      }
    }

    // Similar to web-vitals, we report the current CLS when hard navigating or
    // when the page is hidden
    ssrSafeDocument?.addEventListener('visibilitychange', onHiddenOrPageHide, true)
    ssrSafeDocument?.addEventListener('pagehide', onHiddenOrPageHide, true)

    ssrSafeDocument?.addEventListener(this.softNavEventToListen, () => {
      this.report()
      this.reset()
    })
  }

  abstract observe(initialLoad: boolean): void

  report() {
    if (!this.entryProcessor.metric || this.entryProcessor.metric.value < 0) return

    this.cb(this.entryProcessor.metric, {url: this.url})
  }

  teardown() {
    this.observer?.takeRecords()
    this.observer?.disconnect()
  }

  reset() {
    this.teardown()
    this.entryProcessor.teardown()
    this.entryProcessor = this.initializeProcessor()
    this.observe(false)
  }
}
