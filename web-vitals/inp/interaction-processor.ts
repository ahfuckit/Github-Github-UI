import {BaseProcessor} from '../base/processor'
import {InteractionCountObserver} from './interaction-count'
import {InteractionList, type Interaction} from './interaction-list'
import {INPMetric} from './metric'

export interface CallbackRegistration {
  event: Event
  cb: CallbackFn
}
export type CallbackFn = (data: Interaction) => void

const MAX_INTERACTION_ENTRIES = 10

// Event to PerformanceEventTiming type mapping
const EVENT_TO_PERF_MAP: Record<string, string> = {
  // Mouse events → Pointer events
  mousedown: 'pointerdown',
  mouseup: 'pointerup',
  mousemove: 'pointermove',
  mouseenter: 'pointerenter',
  mouseleave: 'pointerleave',
  mouseover: 'pointerover',
  mouseout: 'pointerout',
  // Touch events → Pointer events
  touchstart: 'pointerdown',
  touchend: 'pointerup',
  touchmove: 'pointermove',
  touchcancel: 'pointercancel',
}

function normalizeEventType(eventType: string): string {
  return EVENT_TO_PERF_MAP[eventType] ?? eventType
}

function eventMatches(entry: PerformanceEventTiming, event: Event) {
  // performance entries don't have a reference to the original event,
  // so we match them based on their type and target. Since the target
  // may not be present in the entry anymore, we match timestamps to within 1ms
  const normalizedEventType = normalizeEventType(event.type)
  return (
    (entry.name === normalizedEventType || entry.name === event.type) &&
    (entry.target === event.target || Math.abs(entry.startTime - event.timeStamp) < 1)
  )
}
/*
 * The InteractionProcessor is responsible for processing PerformanceEventTiming entries and keeping track of the current INP.
 */
export class InteractionProcessor extends BaseProcessor<INPMetric, PerformanceEventTiming> {
  interactions: InteractionList = new InteractionList(MAX_INTERACTION_ENTRIES)
  interactionCountObserver: InteractionCountObserver
  registeredCallbacks: Set<CallbackRegistration> = new Set()

  constructor() {
    super()
    this.interactionCountObserver = new InteractionCountObserver()
    this.interactionCountObserver.observe()
  }

  get metric() {
    const interaction = this.interactions.estimateP98(this.interactionCountObserver.interactionCount)

    // Pages without interactions report INP = 0
    if (!interaction) {
      return null
    }

    return new INPMetric(interaction.latency, interaction.entries)
  }

  override teardown() {
    this.registeredCallbacks.clear()
    this.interactionCountObserver.teardown()
  }

  processEntries(entries: PerformanceEventTiming[]) {
    const callbackMap = new Map<string, CallbackFn>()

    for (const entry of entries) {
      // This is a `event` type entry
      if (entry.interactionId) {
        for (const callback of this.registeredCallbacks) {
          if (eventMatches(entry, callback.event)) {
            callbackMap.set(String(entry.interactionId), callback.cb)
            // avoid checking this callback again since we already found a match
            this.registeredCallbacks.delete(callback)
          }
        }

        this.processEntry(entry)
        continue
      }

      // see https://github.com/GoogleChrome/web-vitals/blob/7b44bea0d5ba6629c5fd34c3a09cc683077871d0/src/onINP.ts#L169-L189
      if (entry.entryType === 'first-input') {
        if (!this.interactions.findEntry(entry)) {
          this.processEntry(entry)
        }
      }
    }

    for (const [interactionId, fn] of callbackMap) {
      const interaction = this.interactions.get(interactionId)
      if (interaction) fn(interaction)
    }
  }

  processEntry(entry: PerformanceEventTiming) {
    const existingInteraction = this.interactions.get(String(entry.interactionId))

    // multiple events may be fired for the same interaction, so we'll only keep
    // the longest duration.
    if (existingInteraction) {
      return this.interactions.update(existingInteraction, entry)
    }

    const interaction: Interaction = {
      id: String(entry.interactionId),
      latency: entry.duration,
      entries: [entry],
    }

    this.interactions.add(interaction)
  }
}
