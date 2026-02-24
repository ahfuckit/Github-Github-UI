import {ssrSafeWindow} from '@github-ui/ssr-utils'
import type {CLSMetric} from './metric'
import {LayoutShiftProcessor} from './layout-shift-processor'
import {BaseObserver} from '../base/observer'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'

const supportsCLS = ssrSafeWindow && 'LayoutShift' in ssrSafeWindow

/*
 * The CLSObserver is responsible for listening to Performance events and routing them to the entryProcessor.
 * It also manages resetting CLS and reporting it when navigating or hiding a page.
 */
export class CLSObserver extends BaseObserver<CLSMetric, LayoutShift> {
  get softNavEventToListen() {
    return SOFT_NAV_STATE.START
  }

  initializeProcessor() {
    return new LayoutShiftProcessor()
  }

  override get supported(): boolean {
    return !!supportsCLS
  }

  observe(initialLoad = true) {
    this.url = ssrSafeWindow?.location.href
    this.observer = new PerformanceObserver(list => {
      this.entryProcessor.processEntries(list.getEntries() as LayoutShift[])
    })

    this.observer.observe({type: 'layout-shift', buffered: initialLoad})
  }
}
