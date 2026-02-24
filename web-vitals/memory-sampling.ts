import {sendCustomMetric} from '@github-ui/stats'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {getHeapUtilization, getHeapSizeBytes} from '@github-ui/use-memory-stats'

/**
 * Maximum number of samples to collect per session.
 * 20 samples × 30s = ~10 minutes of coverage
 */
const MAX_SAMPLES_PER_SESSION = 20

/**
 * Only report metrics if heap changed by more than this threshold (in MB).
 * Reduces noise from stable sessions.
 */
const CHANGE_THRESHOLD_MB = 2

/**
 * Initialize memory sampling to track JS heap size over time.
 * Only available in Chrome/Chromium browsers.
 *
 * @param sampleRate - Fraction of sessions to sample (0-1). Default 0.1 (10%)
 * @returns Cleanup function to stop sampling
 */
export function initMemorySampling(sampleRate = 0.1): () => void {
  // Only sample configured percentage of sessions
  if (Math.random() > sampleRate) return () => {}

  // Chrome only - memory API not available in other browsers
  const initialCheck = getHeapSizeBytes()
  if (initialCheck === null) return () => {}

  // Initialize heap tracking immediately to avoid race conditions with early page hide
  const initialHeap: number = initialCheck
  let maxHeap = initialCheck

  // Track sample count to limit collection duration
  let sampleCount = 0

  // Track last reported heap to skip redundant samples
  let lastReportedHeap = 0

  // Reusable callback to reduce allocations
  const sendMetricCallback = (
    metricName:
      | 'BROWSER_MEMORY_DIST_HEAP_USED'
      | 'BROWSER_MEMORY_DIST_HEAP_UTILIZATION'
      | 'BROWSER_MEMORY_DIST_SESSION_GROWTH'
      | 'BROWSER_MEMORY_DIST_SESSION_MAX',
    value: number,
  ) => {
    sendCustomMetric({
      requestUrl: window.location.href,
      name: metricName,
      value,
    })
  }

  const sendMetricInIdle = (
    metricName:
      | 'BROWSER_MEMORY_DIST_HEAP_USED'
      | 'BROWSER_MEMORY_DIST_HEAP_UTILIZATION'
      | 'BROWSER_MEMORY_DIST_SESSION_GROWTH'
      | 'BROWSER_MEMORY_DIST_SESSION_MAX',
    value: number,
  ) => {
    // Use requestIdleCallback for non-blocking sends, with fallback for unsupported browsers
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => sendMetricCallback(metricName, value))
    } else {
      // Fallback to setTimeout for browsers without requestIdleCallback support
      setTimeout(() => sendMetricCallback(metricName, value), 0)
    }
  }

  const collect = () => {
    // Stop collection if we've reached the max sample count
    if (sampleCount >= MAX_SAMPLES_PER_SESSION) {
      clearInterval(intervalId)
      return
    }

    const heapUsed = getHeapSizeBytes()

    if (heapUsed === null) return

    maxHeap = Math.max(maxHeap, heapUsed)

    // Convert heap size to MB with 2 decimal places
    const heapUsedMB = Math.round((heapUsed / 1024 / 1024) * 100) / 100

    // Skip sample if heap hasn't changed by more than threshold
    if (Math.abs(heapUsedMB - lastReportedHeap) < CHANGE_THRESHOLD_MB) {
      return
    }

    // Increment sample count and update last reported heap
    sampleCount++
    lastReportedHeap = heapUsedMB

    sendMetricInIdle('BROWSER_MEMORY_DIST_HEAP_USED', heapUsedMB)

    // Calculate heap utilization from raw heap size to avoid redundant API calls
    const heapUtilization = getHeapUtilization()
    if (heapUtilization !== null) {
      sendMetricInIdle('BROWSER_MEMORY_DIST_HEAP_UTILIZATION', heapUtilization)
    }
  }

  // Sample every 30 seconds
  const intervalId = setInterval(collect, 30000)

  // Collect session summary on page hide
  const onVisibilityChange = () => {
    if (ssrSafeDocument?.visibilityState === 'hidden') {
      const currentHeap = getHeapSizeBytes()

      if (currentHeap !== null) {
        const growth = (currentHeap - initialHeap) / 1024 / 1024
        sendMetricInIdle('BROWSER_MEMORY_DIST_SESSION_GROWTH', Math.round(growth * 100) / 100)
        sendMetricInIdle('BROWSER_MEMORY_DIST_SESSION_MAX', Math.round((maxHeap / 1024 / 1024) * 100) / 100)
      }
    }
  }

  ssrSafeDocument?.addEventListener('visibilitychange', onVisibilityChange)

  // Initial collection after page settles (5 seconds)
  const timeoutId = setTimeout(collect, 5000)

  // Return cleanup function
  return () => {
    clearInterval(intervalId)
    clearTimeout(timeoutId)
    ssrSafeDocument?.removeEventListener('visibilitychange', onVisibilityChange)
  }
}
