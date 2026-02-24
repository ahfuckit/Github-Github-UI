import {onFCP, onLCP, onTTFB} from 'web-vitals/attribution'
import {sendTimingResults, sendVitals} from './timing-stats'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {HPCObserver} from './hpc'
import {INPObserver} from './inp/observer'
import {ElementTimingObserver} from './element-timing/observer'
import {observeLongTasks} from './long-tasks'
import {observeLongAnimationFrames} from './long-animation-frames'
import {CLSObserver} from './cls/observer'
import {setGlobalINPObserver} from './web-vitals'
import {initMemorySampling} from './memory-sampling'

export function setupWebVitals() {
  sendTimingResults()
  onFCP(sendVitals)
  onLCP(sendVitals)
  onTTFB(sendVitals)
  observeLongTasks()
  observeLongAnimationFrames()

  // Initialize memory sampling (10% of sessions, Chrome only)
  const memorySamplingCleanup = initMemorySampling(0.1)

  const inpObserver = new INPObserver(sendVitals)
  setGlobalINPObserver(inpObserver)
  inpObserver.observe()

  const clsObserver = new CLSObserver(sendVitals)
  clsObserver.observe()

  const etObserver = new ElementTimingObserver(sendVitals)
  etObserver.observe()

  // Start HPC at page load.
  let hpcObserver = new HPCObserver({soft: false, mechanism: 'hard', latestHPCElement: null, callback: sendVitals})
  hpcObserver.connect()
  // Any time we trigger a new soft navigation, we want to reset HPC.
  ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.START, ({mechanism}) => {
    hpcObserver.disconnect()
    hpcObserver = new HPCObserver({
      soft: true,
      mechanism,
      latestHPCElement: document.querySelector('[data-hpc]'),
      callback: sendVitals,
    })
    hpcObserver.connect()
  })

  ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.REPLACE_MECHANISM, ({mechanism}) => {
    hpcObserver.mechanism = mechanism
  })

  // Clean up memory sampling on page unload
  ssrSafeDocument?.addEventListener('pagehide', () => {
    memorySamplingCleanup()
  })
}
