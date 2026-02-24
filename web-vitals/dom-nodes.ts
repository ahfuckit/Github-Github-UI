import {isFeatureEnabled} from '@github-ui/feature-flags'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {ssrSafeDocument} from '@github-ui/ssr-utils'

let previousDomNodeCount: number = 0

ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.START, () => {
  if (!isFeatureEnabled('dom_node_counts')) return
  previousDomNodeCount = countNodes() // nodes may have changes with user interactions / deferred renders
})

function countNodes() {
  return ssrSafeDocument?.getElementsByTagName('*').length || 0
}

export function getDomNodes() {
  return {
    previous: previousDomNodeCount,
    current: countNodes(),
  }
}
