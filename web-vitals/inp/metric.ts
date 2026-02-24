import {BaseMetric} from '../base/metric'
import {getSelector} from '../get-selector'

export type InteractionType = 'text_input' | 'action_click' | 'disclosure' | 'selection' | 'submit' | 'unknown'

export interface INPAttribution {
  interactionTarget?: string
  interactionType?: InteractionType
  eventType?: string
  // Phase timing fields
  inputDelay?: number
  processingDuration?: number
  presentationDelay?: number
}

const INPUT_EVENTS = new Set(['input', 'keydown', 'keyup', 'keypress'])
const POINTER_EVENTS = new Set(['click', 'pointerdown', 'pointerup', 'mousedown', 'mouseup'])

interface EntryFlags {
  isDisclosure: boolean
  isSubmitButton: boolean
  isTextInput: boolean
  isSelection: boolean
  isPointerEventEventType: boolean
  isInputEventType: boolean
}

// WeakMap to store precomputed flags per entry
const entryFlagsMap = new WeakMap<PerformanceEventTiming, EntryFlags>()

function isPointerEvent(eventType: string) {
  return POINTER_EVENTS.has(eventType)
}

/**
 * Check if element is a selection element using native DOM checks for performance.
 * Avoids CSS selector matching.
 */
function isSelectionElement(el: Element): boolean {
  if (el.tagName === 'SELECT') return true
  const role = el.getAttribute('role')
  return role === 'listbox' || role === 'combobox'
}

/**
 * Lazily compute and cache DOM-derived flags for an entry.
 * Ensures each DOM traversal happens only once per entry.
 * Performance optimizations:
 * - Uses native closest() for DOM traversal for better performance
 * - Lazy computation of isSelection only when needed
 * - Native DOM property checks for better performance
 */
function getEntryFlags(entry: PerformanceEventTiming, target: Element | null): EntryFlags {
  const cached = entryFlagsMap.get(entry)
  if (cached) return cached

  const isPointerEventEventType = isPointerEvent(entry.name)
  const isInputEventType = INPUT_EVENTS.has(entry.name)

  // Early return for unknown events on non-select, non-input, non-pointer
  // Only compute isSelection if needed (after checking event type)
  if (!isPointerEventEventType && !isInputEventType) {
    // Lazy computation: only check selection elements when we might need it
    const isSelection = !!(target && isSelectionElement(target))
    if (!isSelection) {
      const flags: EntryFlags = {
        isDisclosure: false,
        isSubmitButton: false,
        isTextInput: false,
        isSelection: false,
        isPointerEventEventType,
        isInputEventType,
      }
      entryFlagsMap.set(entry, flags)
      return flags
    }
  }

  let disclosure = false
  let submitButton = false
  let textInput = false
  // Compute isSelection only when needed (for pointer/input events or when early return didn't happen)
  let isSelection = false

  if (target) {
    // Check if target is a selection element (only when we need it)
    isSelection = isSelectionElement(target)

    // Disclosure and submit detection
    if (isPointerEventEventType) {
      // Use native closest() for disclosure and submit detection
      // This is more efficient than manual traversal as it's implemented in browser native code
      const match = target.closest('details, [aria-expanded], button[type="submit"], input[type="submit"]')

      if (match) {
        // Precedence: disclosure takes priority over submit
        if (match.tagName === 'DETAILS' || match.hasAttribute('aria-expanded')) {
          disclosure = true
        } else if (
          (match.tagName === 'BUTTON' && (match as HTMLButtonElement).type === 'submit') ||
          (match.tagName === 'INPUT' && (match as HTMLInputElement).type === 'submit')
        ) {
          submitButton = true
        }
      }
    }

    // Only compute textInput if event is input type
    // Use direct property checks instead of complex :not() selectors for performance
    if (isInputEventType) {
      if (target.tagName === 'TEXTAREA') {
        textInput = true
      } else if (target.tagName === 'INPUT') {
        const inputType = (target as HTMLInputElement).type
        // Input elements are text inputs unless they're button or submit types
        textInput = inputType !== 'button' && inputType !== 'submit'
      } else if (target instanceof HTMLElement && target.isContentEditable) {
        textInput = true
      }
    }
  }

  const flags: EntryFlags = {
    isDisclosure: disclosure,
    isSubmitButton: submitButton,
    isTextInput: textInput,
    isSelection,
    isPointerEventEventType,
    isInputEventType,
  }

  entryFlagsMap.set(entry, flags)
  return flags
}

/**
 * Determine interaction type using precomputed flags.
 */
function detectInteractionType(entry: PerformanceEventTiming, target: Element | null): InteractionType {
  const eventType = entry.name
  const {isDisclosure, isSubmitButton, isTextInput, isSelection, isPointerEventEventType} = getEntryFlags(entry, target)

  // Precedence rules
  if (isDisclosure) return 'disclosure'
  if (isSubmitButton) return 'submit'
  if (eventType === 'submit') return 'submit'
  if (isTextInput) return 'text_input'
  if (isSelection) return 'selection'
  if (isPointerEventEventType) return 'action_click'

  return 'unknown'
}

/*
 * The INP metric. Compatible with web-vitals' INPMetric interface
 * and suitable for reporting to DataDog and Hydro.
 */
export class INPMetric extends BaseMetric<INPAttribution, PerformanceEventTiming> {
  name = 'INP' as const

  get attribution(): INPAttribution {
    let entry: PerformanceEventTiming | undefined

    // Select the longest interaction (INP definition)
    for (const e of this.entries) {
      if (!entry || e.duration > entry.duration) {
        entry = e
      }
    }

    const target = (entry?.target as Element | null) ?? null

    // Compute phase durations from the PerformanceEventTiming entry
    const inputDelay = entry ? entry.processingStart - entry.startTime : undefined
    const processingDuration = entry ? entry.processingEnd - entry.processingStart : undefined
    const presentationDelay = entry ? entry.duration - (entry.processingEnd - entry.startTime) : undefined

    return {
      interactionTarget: entry && target ? getSelector(target) : '',
      interactionType: entry ? detectInteractionType(entry, target) : undefined,
      eventType: entry?.name,
      inputDelay,
      processingDuration,
      presentationDelay,
    }
  }
}
