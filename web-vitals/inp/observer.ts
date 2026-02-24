import {ssrSafeDocument, ssrSafeWindow} from '@github-ui/ssr-utils'
import type {INPMetric} from './metric'
import {InteractionProcessor, type CallbackRegistration} from './interaction-processor'
import {BaseObserver} from '../base/observer'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {whenIdleOrHidden} from '../utils/when-idle-or-hidden'

const supportsINP =
  // eslint-disable-next-line compat/compat
  ssrSafeWindow && 'PerformanceEventTiming' in ssrSafeWindow && 'interactionId' in PerformanceEventTiming.prototype

/*
 * The INPObserver is responsible for listening to Performance events and routing them to the InteractionProcessor.
 * It also manages resetting INP and reporting it when navigating or hiding a page.
 */
export class INPObserver extends BaseObserver<INPMetric, PerformanceEventTiming> {
  get softNavEventToListen() {
    return SOFT_NAV_STATE.START
  }

  initializeProcessor() {
    return new InteractionProcessor()
  }

  override get supported(): boolean {
    return !!supportsINP
  }

  observe(initialLoad = true) {
    if (!supportsINP) return

    this.url = ssrSafeWindow?.location.href
    this.observer = new PerformanceObserver(list => {
      whenIdleOrHidden(() => {
        this.entryProcessor.processEntries(list.getEntries() as PerformanceEventTiming[])
      })
    })

    if (initialLoad) {
      return this.observeEvents(initialLoad)
    }

    // SOFT_NAV_STATE.RENDER is dispatched when the soft navigation finished rendering.
    // That means that the previous page is fully hidden so we can start listening for new events.
    ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.RENDER, () => {
      this.observeEvents(initialLoad)
    })
  }

  observeEvents(initialLoad: boolean) {
    if (!this.observer) return

    this.observer.observe({type: 'first-input', buffered: initialLoad})
    this.observer.observe({
      type: 'event',
      durationThreshold: 40,
      // buffered events are important on first page load since we may have missed
      // a few until the observer was set up.
      buffered: initialLoad,
    })
  }

  registerCallback(callback: CallbackRegistration) {
    this.interactionProcessor.registeredCallbacks.add(callback)
  }

  override report() {
    const entries = this.observer?.takeRecords()

    if (entries && entries.length) {
      this.entryProcessor.processEntries(entries as PerformanceEventTiming[])
    }

    super.report()
  }

  get interactionProcessor(): InteractionProcessor {
    return this.entryProcessor as InteractionProcessor
  }
}
