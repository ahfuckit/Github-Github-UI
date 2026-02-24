// from https://github.com/GoogleChrome/web-vitals/blob/255855743e6c7a28a81a568ae229bd454559701d/src/lib/whenIdleOrHidden.ts#L23

export const whenIdleOrHidden = (cb: () => void) => {
  // If the document is hidden, run the callback immediately, otherwise
  // race an idle callback with the next `visibilitychange` event.
  if (document.visibilityState === 'hidden') return cb()

  // run callback only once
  let called = false

  const callback = () => {
    if (called) return
    called = true
    cb()
  }

  addEventListener('visibilitychange', callback, {once: true, capture: true})
  // eslint-disable-next-line compat/compat
  requestIdleCallback(() => {
    callback()
    // cleanup listener
    removeEventListener('visibilitychange', callback, {capture: true})
  })
}
