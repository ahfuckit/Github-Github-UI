// When using SSR, browser globals are not available. If you try to use them, Node.js will throw an error
type SSRSafeLocation = Pick<Location, 'pathname' | 'origin' | 'search' | 'hash' | 'href'>

// In some cases, we want to force the server environment to be used in the browser. This is useful for testing/profiling
const forceServer = typeof FORCE_SERVER_ENV !== 'undefined' ? FORCE_SERVER_ENV : false

// eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
export const ssrSafeDocument = typeof document === 'undefined' || forceServer ? undefined : document
// eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
export const ssrSafeWindow = typeof window === 'undefined' || forceServer ? undefined : window
// eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope, no-restricted-globals
export const ssrSafeHistory = typeof history === 'undefined' || forceServer ? undefined : history

// Fallback location object that can be set via setLocation
let fallbackLocation: SSRSafeLocation = {pathname: '', origin: '', search: '', hash: '', href: ''}

// Server-specific getter that can be overridden by the server module
let getServerLocation: (() => URL | undefined) | null = null

// Create a location object with getters that check server getter first, then fallback
function createSSRSafeLocation(): SSRSafeLocation {
  return {
    get pathname() {
      const serverUrl = getServerLocation ? getServerLocation() : undefined
      return serverUrl?.pathname ?? fallbackLocation.pathname
    },
    get origin() {
      const serverUrl = getServerLocation ? getServerLocation() : undefined
      return serverUrl?.origin ?? fallbackLocation.origin
    },
    get search() {
      const serverUrl = getServerLocation ? getServerLocation() : undefined
      return serverUrl?.search ?? fallbackLocation.search
    },
    get hash() {
      const serverUrl = getServerLocation ? getServerLocation() : undefined
      return serverUrl?.hash ?? fallbackLocation.hash
    },
    get href() {
      const serverUrl = getServerLocation ? getServerLocation() : undefined
      return serverUrl?.href ?? fallbackLocation.href
    },
  }
}

export const ssrSafeLocation: SSRSafeLocation =
  // eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
  typeof location === 'undefined' || forceServer ? createSSRSafeLocation() : location

export function setLocation(url: string) {
  // eslint-disable-next-line no-restricted-syntax
  const parsedURL: SSRSafeLocation = new URL(url)
  const {pathname, origin, search, hash, href} = parsedURL

  fallbackLocation = {pathname, origin, search, hash, href}
}

// This is a special helper method for setting the location getter in the SSR environment only
export function setServerLocationGetter(getter: () => URL | undefined) {
  getServerLocation = getter
}
import {ssrSafeDocument} from './ssr-globals'

/***
 * Are we rendering on the server?
 */
export const IS_SERVER = typeof ssrSafeDocument === 'undefined'

/***
 * Are we rendering on the client?
 */
export const IS_BROWSER = !IS_SERVER

/***
 * This helper returns `true` if:
 * - we are rendering on the server
 * - we are on the client, and the app has been hydrated from a server-render
 */
export function wasServerRendered() {
  if (IS_SERVER || !ssrSafeDocument) {
    return true
  }

  return Boolean(
    ssrSafeDocument.querySelector('react-app[data-ssr="true"]') ||
    ssrSafeDocument.querySelector('react-partial[data-ssr="true"][partial-name="repos-overview"]'),
  )
}
import {useSyncExternalStore} from 'react'

const browserEnvironment = {
  type: 'browser',
  isBrowser: true,
  isServer: false,
} as const

const serverEnvironment = {
  type: 'server',
  isBrowser: false,
  isServer: true,
} as const

export type RuntimeEnvironment = typeof browserEnvironment | typeof serverEnvironment

// The runtime environment never changes after initial load, so we use a no-op subscribe
function subscribe() {
  return () => {}
}

function getSnapshot(): RuntimeEnvironment {
  return browserEnvironment
}

function getServerSnapshot(): RuntimeEnvironment {
  return serverEnvironment
}

/**
 * A React hook that returns the current runtime environment.
 *
 * This hook uses `useSyncExternalStore` to properly handle SSR and hydration,
 * ensuring consistent behavior across server and client rendering.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const {isBrowser, isServer, type} = useRuntimeEnvironment()
 *
 *   if (isServer) {
 *     return <ServerPlaceholder />
 *   }
 *
 *   return <BrowserOnlyContent />
 * }
 * ```
 *
 * @returns RuntimeEnvironment object containing:
 *   - `type`: 'browser' | 'server'
 *   - `isBrowser`: boolean
 *   - `isServer`: boolean
 */
export function useRuntimeEnvironment(): RuntimeEnvironment {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
import {use} from 'react'
import {InternalToastsContext, TOAST_SHOW_TIME} from './ToastContext'
import {Toast} from './Toast'

// Renders all toasts including the persisted toast. Likely you'll only want to include this one in a React app, in a
// place common to all pages.
/**
 * ⚠️ Warning: Usage of this component is discouraged by the accessibility team as
 * {@link https://github.com/github/engineering/discussions/3313 toasts are a behavior identified as a high-risk pattern}
 * within GitHub.
 * {@link https://github.com/github/accessibility/issues/4414 Reasons why toasts are a high-risk pattern}.
 */
export function Toasts() {
  const {toasts, persistedToast} = use(InternalToastsContext)

  return (
    <>
      {toasts.map((toastInfo, index) => (
        <Toast
          message={toastInfo.message}
          icon={toastInfo.icon}
          // eslint-disable-next-line @eslint-react/no-array-index-key
          key={index}
          timeToLive={TOAST_SHOW_TIME}
          type={toastInfo.type}
          role={toastInfo.role}
        />
      ))}
      {persistedToast && (
        <Toast
          message={persistedToast.message}
          icon={persistedToast.icon}
          type={persistedToast.type}
          role={persistedToast.role}
        />
      )}
    </>
  )
}
import {useSafeTimeout} from '@primer/react'
import {createContext, type ReactNode, useCallback, use, useMemo, useState} from 'react'
import {noop} from '@github-ui/noop'
import type {ToastRole, ToastType} from './Toast'

export const TOAST_SHOW_TIME = 5000

interface ToastInfo {
  message: ReactNode
  icon?: ReactNode
  type?: ToastType
  role?: ToastRole
}

type ToastContextType = {
  /**
   * ⚠️ Warning: Usage of this hook is discouraged by the accessibility team as
   * {@link https://github.com/github/engineering/discussions/3313 toasts are a behavior identified as a high-risk pattern}
   * within GitHub.
   * {@link https://github.com/github/accessibility/issues/4414 Reasons why toasts are a high-risk pattern}.
   */
  addToast: (toast: ToastInfo) => void
  /**
   * ⚠️ Warning: Usage of this hook is discouraged by the accessibility team as
   * {@link https://github.com/github/engineering/discussions/3313 toasts are a behavior identified as a high-risk pattern}
   * within GitHub.
   * {@link https://github.com/github/accessibility/issues/4414 Reasons why toasts are a high-risk pattern}.
   */
  addPersistedToast: (toast: ToastInfo) => void
  clearPersistedToast: () => void
}
type ToastContextProviderType = {
  children: ReactNode
}

const ToastContext = createContext<ToastContextType>({
  addToast: noop,
  addPersistedToast: noop,
  clearPersistedToast: noop,
})

type InternalToastsContextType = {
  toasts: ToastInfo[]
  persistedToast: ToastInfo | null
}
export const InternalToastsContext = createContext<InternalToastsContextType>({toasts: [], persistedToast: null})

export default ToastContext

export function ToastContextProvider({children}: ToastContextProviderType) {
  const [toasts, setToasts] = useState<ToastInfo[]>([])
  const [persistedToast, setPersistedToast] = useState<ToastInfo | null>(null)
  const {safeSetTimeout} = useSafeTimeout()

  const addToast = useCallback(
    function (toast: ToastInfo) {
      setToasts([...toasts, toast])
      safeSetTimeout(() => setToasts(toasts.slice(1)), TOAST_SHOW_TIME)
    },
    [toasts, safeSetTimeout, setToasts],
  )

  const addPersistedToast = useCallback(
    function (toast: ToastInfo) {
      setPersistedToast(toast)
    },
    [setPersistedToast],
  )

  const clearPersistedToast = useCallback(
    function () {
      setPersistedToast(null)
    },
    [setPersistedToast],
  )

  const contextValue = useMemo(() => {
    return {addToast, addPersistedToast, clearPersistedToast}
  }, [addPersistedToast, addToast, clearPersistedToast])

  const internalToastsContext = useMemo(() => {
    return {toasts, persistedToast}
  }, [toasts, persistedToast])

  return (
    <ToastContext value={contextValue}>
      <InternalToastsContext value={internalToastsContext}>{children}</InternalToastsContext>
    </ToastContext>
  )
}

export function useToastContext() {
  return use(ToastContext)
}
import {CheckIcon, StopIcon, InfoIcon} from '@primer/octicons-react'
import {Portal, useSafeTimeout} from '@primer/react'
import React, {useEffect, type ReactNode, type ReactElement} from 'react'

export type ToastType = 'info' | 'success' | 'error'
export type ToastRole = 'alert' | 'status' | 'log'
export interface ToastProps {
  message: ReactNode
  timeToLive?: number
  icon?: React.ReactNode
  type?: ToastType
  role?: ToastRole
}

const typeClass: Record<ToastType, string> = {
  info: '',
  success: 'Toast--success',
  error: 'Toast--error',
}
const typeIcon: Record<ToastType, ReactElement> = {
  info: <InfoIcon />,
  success: <CheckIcon />,
  error: <StopIcon />,
}

// Default role for the Toast is 'log' because 'status' is not read out by some screen readers.
// Notably, NVDA will not read out popup content if the role is 'status'.
/**
 * ⚠️ Warning: Usage of this component is discouraged by the accessibility team as
 * {@link https://github.com/github/engineering/discussions/3313 toasts are a behavior identified as a high-risk pattern}
 * within GitHub.
 * {@link https://github.com/github/accessibility/issues/4414 Reasons why toasts are a high-risk pattern}.
 */
export const Toast: React.FC<ToastProps> = ({message, timeToLive, icon, type = 'info', role = 'log'}) => {
  const [isVisible, setIsVisible] = React.useState(true)
  const {safeSetTimeout} = useSafeTimeout()

  useEffect(() => {
    if (!timeToLive) return
    safeSetTimeout(() => setIsVisible(false), timeToLive - 300)
  }, [safeSetTimeout, timeToLive])

  return (
    <Portal>
      <div className="p-1 position-fixed bottom-0 left-0 tmp-mb-3 tmp-ml-3">
        <div
          className={`Toast ${typeClass[type]} ${isVisible ? 'Toast--animateIn' : 'Toast--animateOut'}`}
          id="ui-app-toast"
          data-testid={`ui-app-toast-${type}`}
          role={role}
        >
          <span className="Toast-icon">{icon || typeIcon[type]}</span>
          <span className="Toast-content">{message}</span>
        </div>
      </div>
    </Portal>
  )
}import {isFeatureEnabled} from '@github-ui/feature-flags'
import {updateCurrentState} from '@github-ui/history'
import {LRUMap} from '@github-ui/lru-map'
import {matchRoutes} from '@github-ui/react-router'
import {failSoftNav, startSoftNav} from '@github-ui/soft-nav/state'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {reloadPage} from './reload-page'

interface ReactApp extends HTMLElement {
  navigate?: (pathname: string) => Promise<void>
  routes?: never[]
  uuid: string
}

export const bfCache = new LRUMap<string, Map<string, Element>>({size: 20})

function replaceTurboElements({idsToRemove, reactApp}: {idsToRemove: string[]; reactApp: ReactApp}) {
  const removedElements = new Map()

  if (idsToRemove.length === 0) {
    reactApp.hidden = false
    return removedElements
  }

  // Batch DOM changes to prevent flash
  requestAnimationFrame(() => {
    reactApp.hidden = false

    for (const elementId of idsToRemove) {
      const element = document.getElementById(elementId)

      if (element) {
        // Replace elements with hidden placeholders so we know where to restore them later
        const placeholder = document.createElement('div')
        placeholder.id = elementId
        placeholder.hidden = true
        element.replaceWith(placeholder)

        removedElements.set(elementId, element)
      }
    }
  })

  return removedElements
}

export function reactNavigateIfPossible(event: TurboClickEvent | TurboFrameClickEvent) {
  if (!(event.target instanceof HTMLElement)) return

  const target = event.target

  const reactAppName = target.getAttribute('data-react-nav')

  if (!reactAppName) return false

  // Try to use React navigation if the react app is loaded
  const reactApp = Array.from(document.querySelectorAll<ReactApp>('react-app')).find(
    app => app.getAttribute('app-name') === reactAppName,
  )

  if (!reactApp) return false

  const anchorId = target.getAttribute('data-react-nav-anchor')

  const firedReactNav = anchorId
    ? clickOnReactAnchor({event, reactApp, anchorId})
    : imperativelyNavigateToReactRoute({event, reactApp})

  if (!firedReactNav) return false

  const idsToRemove = target.getAttribute('data-react-nav-remove')?.split(',') || []

  if (idsToRemove.length === 0) return firedReactNav

  const currentHref = window.location.href
  updateCurrentState({restoreTurboElements: {appName: reactAppName, idsToRestore: idsToRemove}})

  const handleSoftNavEnd = () => {
    updateCurrentState({restoreReactElements: {appName: reactAppName, idsToRemove}})
    const removedElements = replaceTurboElements({idsToRemove, reactApp})

    if (removedElements) bfCache.set(currentHref, removedElements)

    document.removeEventListener(SOFT_NAV_STATE.ERROR, handleSoftNavError)
  }

  const handleSoftNavError = () => {
    document.removeEventListener(SOFT_NAV_STATE.END, handleSoftNavEnd)
  }

  document.addEventListener(SOFT_NAV_STATE.END, handleSoftNavEnd, {once: true})
  document.addEventListener(SOFT_NAV_STATE.ERROR, handleSoftNavError, {once: true})

  return firedReactNav
}

function clickOnReactAnchor({
  event,
  anchorId,
}: {
  event: TurboClickEvent | TurboFrameClickEvent
  reactApp: ReactApp
  anchorId: string
}) {
  const anchor = document.getElementById(anchorId) as HTMLAnchorElement | null

  if (!anchor) return false

  anchor.click()
  preventTurboNavigation({event})
  return true
}

function imperativelyNavigateToReactRoute({
  event,
  reactApp,
}: {
  event: TurboClickEvent | TurboFrameClickEvent
  reactApp: ReactApp
}) {
  const url = new URL(event.detail.url, window.location.origin)
  const pathname = url.pathname + url.search + url.hash

  const routes = reactApp.routes
  if (!routes || !Array.isArray(routes) || routes.length === 0) return false

  const earlySoftNavEnabled = isFeatureEnabled('react_nav_early_soft_nav')
  // Data-router apps already call startSoftNav via the Proxy wrapper.
  const isDataRouter = reactApp.getAttribute('data-data-router-enabled') === 'true'

  try {
    // Check if the URL matches any routes in the react app
    const matchedRoutes = matchRoutes(routes, url.pathname)

    if (!matchedRoutes || matchedRoutes.length === 0) {
      // Route is not part of the react app, fall back to Turbo navigation
      return false
    }

    if (!reactApp.navigate) return false

    // Fire soft-nav:start early so the INP observer resets before heavy rendering.
    if (earlySoftNavEnabled && !isDataRouter) {
      startSoftNav('react')
    }

    // NOTE: This code interacts with the router/history directly, which is not officially supported
    // by React Router and could break if the underlying libraries change. As we migrate more toward
    // full React pages, usage of this pattern should decrease. If it does break in the future, we'll
    // fallback to a turbo navigation to avoid impacting user experience.
    reactApp.navigate(pathname)
    preventTurboNavigation({event})
    return true
  } catch {
    if (earlySoftNavEnabled && !isDataRouter) {
      failSoftNav()
    }
    return false
  }
}

function preventTurboNavigation({event}: {event: TurboClickEvent | TurboFrameClickEvent}) {
  event.preventDefault() // prevent Turbo navigation
  event.detail.originalEvent?.preventDefault() // prevent the original link click
}

function restoreTurboElements({appName, idsToRestore}: {appName: string; idsToRestore?: string[]}) {
  const reactApp = document.querySelector<HTMLElement>(`react-app[app-name="${appName}"]`)

  const cache = bfCache.get(window.location.href)
  if (!cache && idsToRestore && idsToRestore.length > 0) {
    return reloadPage()
  }

  if (reactApp) reactApp.hidden = true

  if (!cache) return

  requestAnimationFrame(() => {
    // restore Rails cached elements
    for (const [elementId, element] of cache.entries()) {
      const placeholder = document.getElementById(elementId)
      if (placeholder) placeholder.replaceWith(element)
    }
  })
}

ssrSafeWindow?.addEventListener('popstate', ({state}) => {
  if (!state) return

  if (state.restoreTurboElements) {
    return restoreTurboElements(state.restoreTurboElements)
  }

  // Wait for React to render before replacing elements to avoid a blank flash
  if (state.restoreReactElements) {
    document.addEventListener(
      SOFT_NAV_STATE.REACT_DONE,
      () => {
        const reactApp = document.querySelector<ReactApp>(`react-app[app-name="${state.restoreReactElements.appName}"]`)
        if (reactApp) {
          replaceTurboElements({
            idsToRemove: state.restoreReactElements.idsToRemove,
            reactApp,
          })
        }
      },
      {once: true},
    )
  }
})
export interface CacheNode {
  title: string | null | undefined
  transients: Element[]
  bodyClasses: string | null | undefined
  replacedElements: Element[]
}

const DATA_TURBO_LOADED = 'data-turbo-loaded'

export function currentLocation() {
  return location.pathname
}

export function markTurboHasLoaded() {
  document.documentElement.setAttribute(DATA_TURBO_LOADED, '')
}

export function hasTurboLoaded() {
  return document.documentElement.hasAttribute(DATA_TURBO_LOADED)
}

// Check if an event target is a <turbo-frame>
export const isTurboFrame = (el: EventTarget | null): boolean => (el as Element)?.tagName === 'TURBO-FRAME'

// Checks if two urls start with the same "/owner/repo" prefix.
export function isSameRepo(url1: string, url2: string): boolean {
  const path1 = url1.split('/', 3).join('/')
  const path2 = url2.split('/', 3).join('/')
  return path1 === path2
}

// Checks if two urls start with the same "/owner" prefix.
export function isSameProfile(url1: string, url2: string): boolean {
  const path1 = url1.split('/', 2).join('/')
  const path2 = url2.split('/', 2).join('/')
  return path1 === path2
}

// Wait for all stylesheets to be loaded.
export async function waitForStylesheets() {
  const headStylesheets = document.head.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')
  const loadedStylesheets = new Set([...document.styleSheets].map(stylesheet => stylesheet.href))
  const promises = []

  for (const stylesheet of headStylesheets) {
    if (stylesheet.href === '' || loadedStylesheets.has(stylesheet.href)) continue
    promises.push(waitForLoad(stylesheet))
  }

  await Promise.all(promises)
}

const waitForLoad = (stylesheet: HTMLLinkElement, timeout = 2000): Promise<void> => {
  return new Promise(resolve => {
    const onComplete = () => {
      stylesheet.removeEventListener('error', onComplete)
      stylesheet.removeEventListener('load', onComplete)
      resolve()
    }

    stylesheet.addEventListener('load', onComplete, {once: true})
    stylesheet.addEventListener('error', onComplete, {once: true})
    setTimeout(onComplete, timeout)
  })
}

// Replaces all elements with `data-turbo-replace` with the ones coming from the Turbo response.
export const replaceElements = (html: Document, cachedElements?: Element[]) => {
  const newElements = cachedElements || html.querySelectorAll('[data-turbo-replace]')
  const oldElements = [...document.querySelectorAll('[data-turbo-replace]')]

  for (const newElement of newElements) {
    const oldElement = oldElements.find(el => el.id === newElement.id)

    if (oldElement) {
      oldElement.replaceWith(newElement.cloneNode(true))
    }
  }
}

// Adds all missing stylesheets that come from the Turbo response.
export const addNewStylesheets = (html: Document) => {
  // Only add stylesheets that aren't already in the page
  for (const el of html.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')) {
    if (
      !document.head.querySelector(
        `link[href="${el.getAttribute('href')}"],
           link[data-href="${el.getAttribute('data-href')}"]`,
      )
    ) {
      document.head.append(el)
    }
  }
}

// Adds all missing scripts that come from the Turbo response.
export const addNewScripts = (html: Document) => {
  // Only add scripts that aren't already in the page
  for (const el of html.querySelectorAll<HTMLScriptElement>('script')) {
    if (!document.head.querySelector(`script[src="${el.getAttribute('src')}"]`)) {
      executeScriptTag(el)
    }
  }
}

// Load and execute scripts using standard script request.
export const copyScriptTag = (script: HTMLScriptElement) => {
  const {src} = script

  if (!src) {
    // we can't load a script without a source
    return
  }

  // eslint-disable-next-line github/no-dynamic-script-tag
  const newScript = document.createElement('script')
  const type = script.getAttribute('type')
  if (type) newScript.type = type

  newScript.src = src
  return newScript
}

// Load and execute scripts using standard script request.
const executeScriptTag = (script: HTMLScriptElement) => {
  const newScript = copyScriptTag(script)

  if (document.head && newScript) {
    document.head.appendChild(newScript)
  }
}

// Compares all `data-turbo-track="reload"` reload with the ones coming from the Turbo response.
export const getChangedTrackedKeys = (html: Document): string[] => {
  const changedKeys = []
  for (const meta of html.querySelectorAll<HTMLMetaElement>('meta[data-turbo-track="reload"]')) {
    if (
      document.querySelector<HTMLMetaElement>(`meta[http-equiv="${meta.getAttribute('http-equiv')}"]`)?.content !==
      meta.content
    ) {
      changedKeys.push(formatKeyToError(meta.getAttribute('http-equiv') || ''))
    }
  }

  return changedKeys
}

export const getTurboCacheNodes = (html: Document): CacheNode => {
  const head = html.querySelector('[data-turbo-head]') || html.head

  return {
    title: head.querySelector('title')?.textContent,
    transients: [...head.querySelectorAll('[data-turbo-transient]')].map(el => el.cloneNode(true) as Element),
    bodyClasses: html.querySelector<HTMLMetaElement>('meta[name=turbo-body-classes]')?.content,
    replacedElements: [...html.querySelectorAll('[data-turbo-replace]')].map(el => el.cloneNode(true) as Element),
  }
}

export const getDocumentAttributes = () => [...document.documentElement.attributes]

export const formatKeyToError = (key: string) => key.replace(/^x-/, '').replaceAll('-', '_')

export const dispatchTurboReload = (reason: string) =>
  document.dispatchEvent(new CustomEvent('turbo:reload', {detail: {reason}}))

export const dispatchTurboRestored = () => document.dispatchEvent(new CustomEvent('turbo:restored'))

export const replaceElementAttributes = (element: HTMLElement, newElement: HTMLElement) => {
  for (const attr of element.attributes) {
    if (!newElement.hasAttribute(attr.nodeName) && attr.nodeName !== 'aria-busy') {
      element.removeAttribute(attr.nodeName)
    }
  }

  for (const attr of newElement.attributes) {
    if (element.getAttribute(attr.nodeName) !== attr.nodeValue) {
      element.setAttribute(attr.nodeName, attr.nodeValue!)
    }
  }
}

import {session} from '@github/turbo'

interface ProgressBar {
  setValue(n: number): void
  hide(): void
  show(): void
}

export interface BrowserAdapter {
  progressBar: ProgressBar
}

const adapter = session.adapter as typeof session.adapter & BrowserAdapter

let progressBarDelay: ReturnType<typeof setTimeout> | null = null

/**
 * This delay of 99ms is just under our 100ms INP goal
 * https://thehub.github.com/epd/engineering/fundamentals/performance-web-performance/#what-to-look-for
 */
const delay = 99

/**
 * Start the ProgressBar at the top of the page after a 99ms delay.
 * This delay is long enough that very quick interactions will not show the progress bar, making them feel snappier,
 * but it will show for interactions that take longer than 100ms, rescuing INP responsiveness.
 */
export const beginProgressBar = () => {
  progressBarDelay = setTimeout(() => {
    adapter.progressBar.setValue(0)
    adapter.progressBar.show()
  }, delay)
}

/**
 * Complete the ProgressBar at the top of the page.
 */
export const completeProgressBar = () => {
  if (progressBarDelay !== null) {
    clearTimeout(progressBarDelay)
    progressBarDelay = null
  }
  adapter.progressBar.setValue(1)
  adapter.progressBar.hide()
}

performance.mark("js-parse-end:437-ed451d0ef5202580.js");
"use strict";
(globalThis.webpackChunk_github_ui_github_ui = globalThis.webpackChunk_github_ui_github_ui || []).push([["437"], {
	51220(e, t, s) {
		s.d(t, {
			Te: () => h,
			XW: () => a
		});
		var i = s(96540)
		  , n = s(40961)
		  , l = s(36895);
		let o = "u" > typeof document ? i.useLayoutEffect : i.useEffect;
		function r({useFlushSync: e=!0, ...t}) {
			let s = i.useReducer( () => ({}), {})[1]
			  , r = {
				...t,
				onChange: (i, l) => {
					var o;
					e && l ? (0,
					n.flushSync)(s) : s(),
					null == (o = t.onChange) || o.call(t, i, l)
				}
			}
			  , [h] = i.useState( () => new l.YV(r));
			return h.setOptions(r),
			o( () => h._didMount(), []),
			o( () => h._willUpdate()),
			h
		}
		function h(e) {
			return r({
				observeElementRect: l.T6,
				observeElementOffset: l.AO,
				scrollToFn: l.Ox,
				...e
			})
		}
		function a(e) {
			return r({
				getScrollElement: () => "u" > typeof document ? window : null,
				observeElementRect: l.TH,
				observeElementOffset: l.MH,
				scrollToFn: l.e8,
				initialOffset: () => "u" > typeof document ? window.scrollY : 0,
				...e
			})
		}
	},
	36895(e, t, s) {
		function i(e, t, s) {
			let i, n = s.initialDeps ?? [], l = !0;
			function o() {
				var o, r, h;
				let a, u;
				s.key && (null == (o = s.debug) ? void 0 : o.call(s)) && (a = Date.now());
				let d = e();
				if (!(d.length !== n.length || d.some( (e, t) => n[t] !== e)))
					return i;
				if (n = d,
				s.key && (null == (r = s.debug) ? void 0 : r.call(s)) && (u = Date.now()),
				i = t(...d),
				s.key && (null == (h = s.debug) ? void 0 : h.call(s))) {
					let e = Math.round((Date.now() - a) * 100) / 100
					  , t = Math.round((Date.now() - u) * 100) / 100
					  , i = t / 16
					  , n = (e, t) => {
						for (e = String(e); e.length < t; )
							e = " " + e;
						return e
					}
					;
					console.info(`%c\u{23F1} ${n(t, 5)} /${n(e, 5)} ms`, `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(0, Math.min(120 - 120 * i, 120))}deg 100% 31%);`, null == s ? void 0 : s.key)
				}
				return (null == s ? void 0 : s.onChange) && !(l && s.skipInitialOnChange) && s.onChange(i),
				l = !1,
				i
			}
			return o.updateDeps = e => {
				n = e
			}
			,
			o
		}
		function n(e, t) {
			if (void 0 !== e)
				return e;
			throw Error(`Unexpected undefined${t ? `: ${t}` : ""}`)
		}
		s.d(t, {
			T6: () => a,
			vp: () => h,
			e8: () => p,
			AO: () => m,
			Ox: () => v,
			TH: () => d,
			YV: () => b,
			MH: () => f
		});
		let l = (e, t, s) => {
			let i;
			return function(...n) {
				e.clearTimeout(i),
				i = e.setTimeout( () => t.apply(this, n), s)
			}
		}
		  , o = e => {
			let {offsetWidth: t, offsetHeight: s} = e;
			return {
				width: t,
				height: s
			}
		}
		  , r = e => e
		  , h = e => {
			let t = Math.max(e.startIndex - e.overscan, 0)
			  , s = Math.min(e.endIndex + e.overscan, e.count - 1)
			  , i = [];
			for (let e = t; e <= s; e++)
				i.push(e);
			return i
		}
		  , a = (e, t) => {
			let s = e.scrollElement;
			if (!s)
				return;
			let i = e.targetWindow;
			if (!i)
				return;
			let n = e => {
				let {width: s, height: i} = e;
				t({
					width: Math.round(s),
					height: Math.round(i)
				})
			}
			;
			if (n(o(s)),
			!i.ResizeObserver)
				return () => {}
				;
			let l = new i.ResizeObserver(t => {
				let i = () => {
					let e = t[0];
					if (null == e ? void 0 : e.borderBoxSize) {
						let t = e.borderBoxSize[0];
						if (t)
							return void n({
								width: t.inlineSize,
								height: t.blockSize
							})
					}
					n(o(s))
				}
				;
				e.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(i) : i()
			}
			);
			return l.observe(s, {
				box: "border-box"
			}),
			() => {
				l.unobserve(s)
			}
		}
		  , u = {
			passive: !0
		}
		  , d = (e, t) => {
			let s = e.scrollElement;
			if (!s)
				return;
			let i = () => {
				t({
					width: s.innerWidth,
					height: s.innerHeight
				})
			}
			;
			return i(),
			s.addEventListener("resize", i, u),
			() => {
				s.removeEventListener("resize", i)
			}
		}
		  , c = "u" < typeof window || "onscrollend"in window
		  , m = (e, t) => {
			let s = e.scrollElement;
			if (!s)
				return;
			let i = e.targetWindow;
			if (!i)
				return;
			let n = 0
			  , o = e.options.useScrollendEvent && c ? () => void 0 : l(i, () => {
				t(n, !1)
			}
			, e.options.isScrollingResetDelay)
			  , r = i => () => {
				let {horizontal: l, isRtl: r} = e.options;
				n = l ? s.scrollLeft * (r && -1 || 1) : s.scrollTop,
				o(),
				t(n, i)
			}
			  , h = r(!0)
			  , a = r(!1);
			s.addEventListener("scroll", h, u);
			let d = e.options.useScrollendEvent && c;
			return d && s.addEventListener("scrollend", a, u),
			() => {
				s.removeEventListener("scroll", h),
				d && s.removeEventListener("scrollend", a)
			}
		}
		  , f = (e, t) => {
			let s = e.scrollElement;
			if (!s)
				return;
			let i = e.targetWindow;
			if (!i)
				return;
			let n = 0
			  , o = e.options.useScrollendEvent && c ? () => void 0 : l(i, () => {
				t(n, !1)
			}
			, e.options.isScrollingResetDelay)
			  , r = i => () => {
				n = s[e.options.horizontal ? "scrollX" : "scrollY"],
				o(),
				t(n, i)
			}
			  , h = r(!0)
			  , a = r(!1);
			s.addEventListener("scroll", h, u);
			let d = e.options.useScrollendEvent && c;
			return d && s.addEventListener("scrollend", a, u),
			() => {
				s.removeEventListener("scroll", h),
				d && s.removeEventListener("scrollend", a)
			}
		}
		  , g = (e, t, s) => {
			if (null == t ? void 0 : t.borderBoxSize) {
				let e = t.borderBoxSize[0];
				if (e)
					return Math.round(e[s.options.horizontal ? "inlineSize" : "blockSize"])
			}
			return e[s.options.horizontal ? "offsetWidth" : "offsetHeight"]
		}
		  , p = (e, {adjustments: t=0, behavior: s}, i) => {
			var n, l;
			null == (l = null == (n = i.scrollElement) ? void 0 : n.scrollTo) || l.call(n, {
				[i.options.horizontal ? "left" : "top"]: e + t,
				behavior: s
			})
		}
		  , v = (e, {adjustments: t=0, behavior: s}, i) => {
			var n, l;
			null == (l = null == (n = i.scrollElement) ? void 0 : n.scrollTo) || l.call(n, {
				[i.options.horizontal ? "left" : "top"]: e + t,
				behavior: s
			})
		}
		;
		class b {
			constructor(e) {
				this.unsubs = [],
				this.scrollElement = null,
				this.targetWindow = null,
				this.isScrolling = !1,
				this.currentScrollToIndex = null,
				this.measurementsCache = [],
				this.itemSizeCache = new Map,
				this.laneAssignments = new Map,
				this.pendingMeasuredCacheIndexes = [],
				this.prevLanes = void 0,
				this.lanesChangedFlag = !1,
				this.lanesSettling = !1,
				this.scrollRect = null,
				this.scrollOffset = null,
				this.scrollDirection = null,
				this.scrollAdjustments = 0,
				this.elementsCache = new Map,
				this.observer = ( () => {
					let e = null
					  , t = () => e || (this.targetWindow && this.targetWindow.ResizeObserver ? e = new this.targetWindow.ResizeObserver(e => {
						e.forEach(e => {
							let t = () => {
								this._measureElement(e.target, e)
							}
							;
							this.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(t) : t()
						}
						)
					}
					) : null);
					return {
						disconnect: () => {
							var s;
							null == (s = t()) || s.disconnect(),
							e = null
						}
						,
						observe: e => {
							var s;
							return null == (s = t()) ? void 0 : s.observe(e, {
								box: "border-box"
							})
						}
						,
						unobserve: e => {
							var s;
							return null == (s = t()) ? void 0 : s.unobserve(e)
						}
					}
				}
				)(),
				this.range = null,
				this.setOptions = e => {
					Object.entries(e).forEach( ([t,s]) => {
						void 0 === s && delete e[t]
					}
					),
					this.options = {
						debug: !1,
						initialOffset: 0,
						overscan: 1,
						paddingStart: 0,
						paddingEnd: 0,
						scrollPaddingStart: 0,
						scrollPaddingEnd: 0,
						horizontal: !1,
						getItemKey: r,
						rangeExtractor: h,
						onChange: () => {}
						,
						measureElement: g,
						initialRect: {
							width: 0,
							height: 0
						},
						scrollMargin: 0,
						gap: 0,
						indexAttribute: "data-index",
						initialMeasurementsCache: [],
						lanes: 1,
						isScrollingResetDelay: 150,
						enabled: !0,
						isRtl: !1,
						useScrollendEvent: !1,
						useAnimationFrameWithResizeObserver: !1,
						...e
					}
				}
				,
				this.notify = e => {
					var t, s;
					null == (s = (t = this.options).onChange) || s.call(t, this, e)
				}
				,
				this.maybeNotify = i( () => (this.calculateRange(),
				[this.isScrolling, this.range ? this.range.startIndex : null, this.range ? this.range.endIndex : null]), e => {
					this.notify(e)
				}
				, {
					key: !1,
					debug: () => this.options.debug,
					initialDeps: [this.isScrolling, this.range ? this.range.startIndex : null, this.range ? this.range.endIndex : null]
				}),
				this.cleanup = () => {
					this.unsubs.filter(Boolean).forEach(e => e()),
					this.unsubs = [],
					this.observer.disconnect(),
					this.scrollElement = null,
					this.targetWindow = null
				}
				,
				this._didMount = () => () => {
					this.cleanup()
				}
				,
				this._willUpdate = () => {
					var e;
					let t = this.options.enabled ? this.options.getScrollElement() : null;
					if (this.scrollElement !== t) {
						if (this.cleanup(),
						!t)
							return void this.maybeNotify();
						this.scrollElement = t,
						this.scrollElement && "ownerDocument"in this.scrollElement ? this.targetWindow = this.scrollElement.ownerDocument.defaultView : this.targetWindow = (null == (e = this.scrollElement) ? void 0 : e.window) ?? null,
						this.elementsCache.forEach(e => {
							this.observer.observe(e)
						}
						),
						this.unsubs.push(this.options.observeElementRect(this, e => {
							this.scrollRect = e,
							this.maybeNotify()
						}
						)),
						this.unsubs.push(this.options.observeElementOffset(this, (e, t) => {
							this.scrollAdjustments = 0,
							this.scrollDirection = t ? this.getScrollOffset() < e ? "forward" : "backward" : null,
							this.scrollOffset = e,
							this.isScrolling = t,
							this.maybeNotify()
						}
						)),
						this._scrollToOffset(this.getScrollOffset(), {
							adjustments: void 0,
							behavior: void 0
						})
					}
				}
				,
				this.getSize = () => this.options.enabled ? (this.scrollRect = this.scrollRect ?? this.options.initialRect,
				this.scrollRect[this.options.horizontal ? "width" : "height"]) : (this.scrollRect = null,
				0),
				this.getScrollOffset = () => this.options.enabled ? (this.scrollOffset = this.scrollOffset ?? ("function" == typeof this.options.initialOffset ? this.options.initialOffset() : this.options.initialOffset),
				this.scrollOffset) : (this.scrollOffset = null,
				0),
				this.getFurthestMeasurement = (e, t) => {
					let s = new Map
					  , i = new Map;
					for (let n = t - 1; n >= 0; n--) {
						let t = e[n];
						if (s.has(t.lane))
							continue;
						let l = i.get(t.lane);
						if (null == l || t.end > l.end ? i.set(t.lane, t) : t.end < l.end && s.set(t.lane, !0),
						s.size === this.options.lanes)
							break
					}
					return i.size === this.options.lanes ? Array.from(i.values()).sort( (e, t) => e.end === t.end ? e.index - t.index : e.end - t.end)[0] : void 0
				}
				,
				this.getMeasurementOptions = i( () => [this.options.count, this.options.paddingStart, this.options.scrollMargin, this.options.getItemKey, this.options.enabled, this.options.lanes], (e, t, s, i, n, l) => (void 0 !== this.prevLanes && this.prevLanes !== l && (this.lanesChangedFlag = !0),
				this.prevLanes = l,
				this.pendingMeasuredCacheIndexes = [],
				{
					count: e,
					paddingStart: t,
					scrollMargin: s,
					getItemKey: i,
					enabled: n,
					lanes: l
				}), {
					key: !1
				}),
				this.getMeasurements = i( () => [this.getMeasurementOptions(), this.itemSizeCache], ({count: e, paddingStart: t, scrollMargin: s, getItemKey: i, enabled: n, lanes: l}, o) => {
					if (!n)
						return this.measurementsCache = [],
						this.itemSizeCache.clear(),
						this.laneAssignments.clear(),
						[];
					if (this.laneAssignments.size > e)
						for (let t of this.laneAssignments.keys())
							t >= e && this.laneAssignments.delete(t);
					this.lanesChangedFlag && (this.lanesChangedFlag = !1,
					this.lanesSettling = !0,
					this.measurementsCache = [],
					this.itemSizeCache.clear(),
					this.laneAssignments.clear(),
					this.pendingMeasuredCacheIndexes = []),
					0 !== this.measurementsCache.length || this.lanesSettling || (this.measurementsCache = this.options.initialMeasurementsCache,
					this.measurementsCache.forEach(e => {
						this.itemSizeCache.set(e.key, e.size)
					}
					));
					let r = this.lanesSettling ? 0 : this.pendingMeasuredCacheIndexes.length > 0 ? Math.min(...this.pendingMeasuredCacheIndexes) : 0;
					this.pendingMeasuredCacheIndexes = [],
					this.lanesSettling && this.measurementsCache.length === e && (this.lanesSettling = !1);
					let h = this.measurementsCache.slice(0, r)
					  , a = Array(l).fill(void 0);
					for (let e = 0; e < r; e++) {
						let t = h[e];
						t && (a[t.lane] = e)
					}
					for (let n = r; n < e; n++) {
						let e, l, r = i(n), u = this.laneAssignments.get(n);
						if (void 0 !== u && this.options.lanes > 1) {
							let i = a[e = u]
							  , n = void 0 !== i ? h[i] : void 0;
							l = n ? n.end + this.options.gap : t + s
						} else {
							let i = 1 === this.options.lanes ? h[n - 1] : this.getFurthestMeasurement(h, n);
							l = i ? i.end + this.options.gap : t + s,
							e = i ? i.lane : n % this.options.lanes,
							this.options.lanes > 1 && this.laneAssignments.set(n, e)
						}
						let d = o.get(r)
						  , c = "number" == typeof d ? d : this.options.estimateSize(n)
						  , m = l + c;
						h[n] = {
							index: n,
							start: l,
							size: c,
							end: m,
							key: r,
							lane: e
						},
						a[e] = n
					}
					return this.measurementsCache = h,
					h
				}
				, {
					key: !1,
					debug: () => this.options.debug
				}),
				this.calculateRange = i( () => [this.getMeasurements(), this.getSize(), this.getScrollOffset(), this.options.lanes], (e, t, s, i) => this.range = e.length > 0 && t > 0 ? function({measurements: e, outerSize: t, scrollOffset: s, lanes: i}) {
					let n = e.length - 1;
					if (e.length <= i)
						return {
							startIndex: 0,
							endIndex: n
						};
					let l = S(0, n, t => e[t].start, s)
					  , o = l;
					if (1 === i)
						for (; o < n && e[o].end < s + t; )
							o++;
					else if (i > 1) {
						let r = Array(i).fill(0);
						for (; o < n && r.some(e => e < s + t); ) {
							let t = e[o];
							r[t.lane] = t.end,
							o++
						}
						let h = Array(i).fill(s + t);
						for (; l >= 0 && h.some(e => e >= s); ) {
							let t = e[l];
							h[t.lane] = t.start,
							l--
						}
						l = Math.max(0, l - l % i),
						o = Math.min(n, o + (i - 1 - o % i))
					}
					return {
						startIndex: l,
						endIndex: o
					}
				}({
					measurements: e,
					outerSize: t,
					scrollOffset: s,
					lanes: i
				}) : null, {
					key: !1,
					debug: () => this.options.debug
				}),
				this.getVirtualIndexes = i( () => {
					let e = null
					  , t = null
					  , s = this.calculateRange();
					return s && (e = s.startIndex,
					t = s.endIndex),
					this.maybeNotify.updateDeps([this.isScrolling, e, t]),
					[this.options.rangeExtractor, this.options.overscan, this.options.count, e, t]
				}
				, (e, t, s, i, n) => null === i || null === n ? [] : e({
					startIndex: i,
					endIndex: n,
					overscan: t,
					count: s
				}), {
					key: !1,
					debug: () => this.options.debug
				}),
				this.indexFromElement = e => {
					let t = this.options.indexAttribute
					  , s = e.getAttribute(t);
					return s ? parseInt(s, 10) : (console.warn(`Missing attribute name '${t}={index}' on measured element.`),
					-1)
				}
				,
				this._measureElement = (e, t) => {
					let s = this.indexFromElement(e)
					  , i = this.measurementsCache[s];
					if (!i)
						return;
					let n = i.key
					  , l = this.elementsCache.get(n);
					l !== e && (l && this.observer.unobserve(l),
					this.observer.observe(e),
					this.elementsCache.set(n, e)),
					e.isConnected && this.resizeItem(s, this.options.measureElement(e, t, this))
				}
				,
				this.resizeItem = (e, t) => {
					let s = this.measurementsCache[e];
					if (!s)
						return;
					let i = t - (this.itemSizeCache.get(s.key) ?? s.size);
					0 !== i && ((void 0 !== this.shouldAdjustScrollPositionOnItemSizeChange ? this.shouldAdjustScrollPositionOnItemSizeChange(s, i, this) : s.start < this.getScrollOffset() + this.scrollAdjustments) && this._scrollToOffset(this.getScrollOffset(), {
						adjustments: this.scrollAdjustments += i,
						behavior: void 0
					}),
					this.pendingMeasuredCacheIndexes.push(s.index),
					this.itemSizeCache = new Map(this.itemSizeCache.set(s.key, t)),
					this.notify(!1))
				}
				,
				this.measureElement = e => {
					e ? this._measureElement(e, void 0) : this.elementsCache.forEach( (e, t) => {
						e.isConnected || (this.observer.unobserve(e),
						this.elementsCache.delete(t))
					}
					)
				}
				,
				this.getVirtualItems = i( () => [this.getVirtualIndexes(), this.getMeasurements()], (e, t) => {
					let s = [];
					for (let i = 0, n = e.length; i < n; i++) {
						let n = t[e[i]];
						s.push(n)
					}
					return s
				}
				, {
					key: !1,
					debug: () => this.options.debug
				}),
				this.getVirtualItemForOffset = e => {
					let t = this.getMeasurements();
					if (0 !== t.length)
						return n(t[S(0, t.length - 1, e => n(t[e]).start, e)])
				}
				,
				this.getMaxScrollOffset = () => {
					if (!this.scrollElement)
						return 0;
					if ("scrollHeight"in this.scrollElement)
						return this.options.horizontal ? this.scrollElement.scrollWidth - this.scrollElement.clientWidth : this.scrollElement.scrollHeight - this.scrollElement.clientHeight;
					{
						let e = this.scrollElement.document.documentElement;
						return this.options.horizontal ? e.scrollWidth - this.scrollElement.innerWidth : e.scrollHeight - this.scrollElement.innerHeight
					}
				}
				,
				this.getOffsetForAlignment = (e, t, s=0) => {
					if (!this.scrollElement)
						return 0;
					let i = this.getSize()
					  , n = this.getScrollOffset();
					return "auto" === t && (t = e >= n + i ? "end" : "start"),
					"center" === t ? e += (s - i) / 2 : "end" === t && (e -= i),
					Math.max(Math.min(this.getMaxScrollOffset(), e), 0)
				}
				,
				this.getOffsetForIndex = (e, t="auto") => {
					e = Math.max(0, Math.min(e, this.options.count - 1));
					let s = this.measurementsCache[e];
					if (!s)
						return;
					let i = this.getSize()
					  , n = this.getScrollOffset();
					if ("auto" === t)
						if (s.end >= n + i - this.options.scrollPaddingEnd)
							t = "end";
						else {
							if (!(s.start <= n + this.options.scrollPaddingStart))
								return [n, t];
							t = "start"
						}
					if ("end" === t && e === this.options.count - 1)
						return [this.getMaxScrollOffset(), t];
					let l = "end" === t ? s.end + this.options.scrollPaddingEnd : s.start - this.options.scrollPaddingStart;
					return [this.getOffsetForAlignment(l, t, s.size), t]
				}
				,
				this.isDynamicMode = () => this.elementsCache.size > 0,
				this.scrollToOffset = (e, {align: t="start", behavior: s}={}) => {
					"smooth" === s && this.isDynamicMode() && console.warn("The `smooth` scroll behavior is not fully supported with dynamic size."),
					this._scrollToOffset(this.getOffsetForAlignment(e, t), {
						adjustments: void 0,
						behavior: s
					})
				}
				,
				this.scrollToIndex = (e, {align: t="auto", behavior: s}={}) => {
					"smooth" === s && this.isDynamicMode() && console.warn("The `smooth` scroll behavior is not fully supported with dynamic size."),
					e = Math.max(0, Math.min(e, this.options.count - 1)),
					this.currentScrollToIndex = e;
					let i = 0
					  , n = t => {
						if (!this.targetWindow)
							return;
						let i = this.getOffsetForIndex(e, t);
						if (!i)
							return void console.warn("Failed to get offset for index:", e);
						let[n,o] = i;
						this._scrollToOffset(n, {
							adjustments: void 0,
							behavior: s
						}),
						this.targetWindow.requestAnimationFrame( () => {
							let t = () => {
								if (this.currentScrollToIndex !== e)
									return;
								let t = this.getScrollOffset()
								  , s = this.getOffsetForIndex(e, o);
								s ? 1.01 > Math.abs(s[0] - t) || l(o) : console.warn("Failed to get offset for index:", e)
							}
							;
							this.isDynamicMode() ? this.targetWindow.requestAnimationFrame(t) : t()
						}
						)
					}
					  , l = t => {
						this.targetWindow && this.currentScrollToIndex === e && (++i < 10 ? this.targetWindow.requestAnimationFrame( () => n(t)) : console.warn(`Failed to scroll to index ${e} after 10 attempts.`))
					}
					;
					n(t)
				}
				,
				this.scrollBy = (e, {behavior: t}={}) => {
					"smooth" === t && this.isDynamicMode() && console.warn("The `smooth` scroll behavior is not fully supported with dynamic size."),
					this._scrollToOffset(this.getScrollOffset() + e, {
						adjustments: void 0,
						behavior: t
					})
				}
				,
				this.getTotalSize = () => {
					var e;
					let t, s = this.getMeasurements();
					if (0 === s.length)
						t = this.options.paddingStart;
					else if (1 === this.options.lanes)
						t = (null == (e = s[s.length - 1]) ? void 0 : e.end) ?? 0;
					else {
						let e = Array(this.options.lanes).fill(null)
						  , i = s.length - 1;
						for (; i >= 0 && e.some(e => null === e); ) {
							let t = s[i];
							null === e[t.lane] && (e[t.lane] = t.end),
							i--
						}
						t = Math.max(...e.filter(e => null !== e))
					}
					return Math.max(t - this.options.scrollMargin + this.options.paddingEnd, 0)
				}
				,
				this._scrollToOffset = (e, {adjustments: t, behavior: s}) => {
					this.options.scrollToFn(e, {
						behavior: s,
						adjustments: t
					}, this)
				}
				,
				this.measure = () => {
					this.itemSizeCache = new Map,
					this.laneAssignments = new Map,
					this.notify(!1)
				}
				,
				this.setOptions(e)
			}
		}
		let S = (e, t, s, i) => {
			for (; e <= t; ) {
				let n = (e + t) / 2 | 0
				  , l = s(n);
				if (l < i)
					e = n + 1;
				else {
					if (!(l > i))
						return n;
					t = n - 1
				}
			}
			return e > 0 ? e - 1 : 0
		}
	}
}]);
//# sourceMappiimport {useEffect} from 'react'
import useIsMounted from '@github-ui/use-is-mounted'
import {getSession} from '@github-ui/alive'
import {connectAliveSubscription} from '@github-ui/alive/connect-alive-subscription'
import {useTestSubscribeToAlive} from './TestAliveSubscription'

/**
 * Subscribe to an alive channel with a signed channel name. Event data
 * will be passed to the callback.
 * @param signedChannel the signed channel name, provided from the server
 * @param callback a callback to receive events from the alive channel. This callback should be memoized to avoid unnecessary resubscribes when React re-renders.
 */
export function useAlive<T>(signedChannel: string | null | undefined, callback: (data: T) => unknown) {
  const isMounted = useIsMounted()
  const testSubscribeToAlive = useTestSubscribeToAlive()

  useEffect(() => {
    let unsubscribeFromAlive = () => {}
    let closed = false

    async function subscribeToAlive() {
      if (!signedChannel) return

      if (typeof testSubscribeToAlive === 'function') {
        const subs = await testSubscribeToAlive(signedChannel, callback as (data: unknown) => unknown)
        if (subs) {
          unsubscribeFromAlive = subs.unsubscribe
        }
        return
      }

      try {
        const aliveSession = await getSession()
        if (closed) {
          // Possible we unsubscribed before the session returned
          // this is fine, we just don't subscribe to the channel on the alive side
          return
        }
        const resp = connectAliveSubscription(aliveSession, signedChannel, callback)
        if (resp?.unsubscribe) {
          if (isMounted()) {
            unsubscribeFromAlive = resp.unsubscribe
          } else {
            resp.unsubscribe()
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
    }

    subscribeToAlive()

    return () => {
      closed = true
      unsubscribeFromAlive()
    }
  }, [signedChannel, callback, isMounted, testSubscribeToAlive])
}
ngURL=437-ed451d0ef5202580-db1db7af95e0f108.js.map
import {useCallback, use} from 'react'
import {sendEvent} from '@github-ui/hydro-analytics'
import {AnalyticsContext} from '@github-ui/analytics-provider/context'

export interface AnalyticsEvent {
  category: string
  action: string
  label: string
  [key: string]: unknown
}

export type SendAnalyticsEventFunction = (
  eventType: string,
  target?: string,
  payload?: {[key: string]: unknown} | AnalyticsEvent,
) => void

/**
 * Use this hook with the AnalyticsContext to send user analytics events to the data warehouse.
 * This hook will read values from the nearest AnalyticsContext.Provider, though you can override properties directly when sending an event.
 * It uses the `sendEvent` helper from `github/hydro-analytics`,
 * which enriches event context with additional information about the user, repository, and current page.
 * See: https://thehub.github.com/epd/engineering/products-and-services/internal/hydro/installation/browser-events/
 *
 * You can find a list of all included context properties in `app/helpers/octolytics_helper.rb`.
 *
 *
 * @example
 * ```tsx
 * function Component() {
 *   const { sendAnalyticsEvent } = useAnalytics()
 *   return <Button onClick={() => sendAnalyticsEvent('file_tree.close', 'FILE_TREE_TOGGLE')}>CLOSE TREE</Button>
 * }
 * ```
 *
 */
export function useAnalytics(): {
  sendAnalyticsEvent: SendAnalyticsEventFunction
} {
  // WARNING: Do not add any hooks here that will cause rerenders on soft navs.
  const contextData = use(AnalyticsContext)

  if (!contextData) {
    throw new Error('useAnalytics must be used within an AnalyticsContext')
  }
  const {appName, category, metadata} = contextData

  return {
    sendAnalyticsEvent: useCallback(
      (eventType, target?, payload = {}) => {
        const context = {
          react: true,
          ['app_name']: appName,
          category,
          ...metadata,
        }
        sendEvent(eventType, {...context, ...payload, target})
      },
      [appName, category, metadata],
    ),
  }
}

/**
 * Use this hook with the AnalyticsContext to send user analytics events to the data warehouse.
 * This hook will read values from the nearest AnalyticsContext.Provider, though you can override properties directly when sending an event.
 * It uses the `sendEvent` helper from `github/hydro-analytics`,
 * which enriches event context with additional information about the user, repository, and current page.
 * See: https://thehub.github.com/epd/engineering/products-and-services/internal/hydro/installation/browser-events/
 *
 * You can find a list of all included context properties in `app/helpers/octolytics_helper.rb`.
 *
 *
 * @example
 * ```tsx
 * function Component() {
 *   const { sendClickAnalyticsEvent } = useClickAnalytics()
 *   return <Button onClick={() => sendClickAnalyticsEvent({category: '...', action: '...', label: '...'})}>Submit</Button>
 * }
 * ```
 *
 */
export function useClickAnalytics(): {
  sendClickAnalyticsEvent: (payload?: {[key: string]: unknown} | AnalyticsEvent) => void
} {
  const {sendAnalyticsEvent} = useAnalytics()
  return {
    sendClickAnalyticsEvent: useCallback(
      (payload = {}) => {
        sendAnalyticsEvent('analytics.click', undefined, payload)
      },
      [sendAnalyticsEvent],
    ),
  }
}
import type {DependencyList} from 'react'
import {useCallback, useLayoutEffect, useRef, useState} from 'react'

// eslint-disable-next-line no-restricted-imports
import {RenderPhase, useRenderPhase} from '@github-ui/render-phase-provider'

type ClientValueCallback<T> = (previousValue?: T) => T

/**
 * This hook allows reading browser-only values in an SSR / hydration safe manner while guaranteeing the minimum
 * number of re-renders during CSR.
 * - In CSR, this hook will resolve the `clientValueCallback` on first render.
 * - In SSR, the `serverValue` will be returned.
 * - Finally, after hydration, the `clientValueCallback` will be resolved.
 *
 * Note that between SSR and hydration, this can cause flashes of unhydrated content when server and client values
 * differ, however this hook will not result in hydration mismatch warnings and bugs.
 *
 * @see https://thehub.github.com/epd/engineering/dev-practicals/frontend/react/ssr/ssr-tools/#useclientvalue-source
 *
 * @example
 * const [origin, updateOrigin] = useClientValue(() => window.location.origin, 'github.com', [window?.location?.origin])
 *
 * @param clientValueCallback A function that returns the value to be used on the client.
 * @param serverValue A value to be used during SSR on the server.
 * @param deps A dependency array used to memoize the `clientValueCallback`.
 *         Note that if including a browser global in the array, be sure to check for it's existence
 *         (eg `window?.api?.value`) as it may not be available in SSR.
 * @returns  [
 *             `clientValue` (Either a browser-only value, or a server fallback),\n
 *             `updateValue` (A function that can be used to update the `clientValue` by re-running the `clientValueCallback`)
 *           ]
 *
 * *Credit https://www.benmvp.com/blog/handling-react-server-mismatch-error/ for inspiration*
 */
export function useClientValue<T>(
  clientValueCallback: ClientValueCallback<T>,
  serverValue: T,
  deps?: DependencyList,
): [T, () => void]
export function useClientValue<T>(
  clientValueCallback: ClientValueCallback<T>,
  serverValue?: T,
  deps?: DependencyList,
): [T | undefined, () => void]
export function useClientValue<T>(
  clientValueCallback: ClientValueCallback<T>,
  serverValue?: T,
  deps: DependencyList = [],
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedCallback = useCallback(clientValueCallback, deps)
  const renderPhase = useRenderPhase()
  const isCSRFirstRender = useRef(renderPhase === RenderPhase.ClientRender)

  const [clientValue, setClientValue] = useState<T | undefined>(() => {
    if (renderPhase === RenderPhase.ClientRender) return memoizedCallback()
    return serverValue
  })

  const updateClientValue = useCallback(() => {
    setClientValue(memoizedCallback)
  }, [memoizedCallback])

  useLayoutEffect(() => {
    // in CSR on first render we've already set the value in the `useState` above
    if (!isCSRFirstRender.current) {
      setClientValue(memoizedCallback)
    }
    isCSRFirstRender.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoizedCallback, ...deps])

  return [clientValue, updateClientValue]
}import {useTrackingRef} from '@github-ui/use-tracking-ref'
import debounce, {type DebouncedFunc, type DebounceSettings} from 'lodash-es/debounce'
import {useEffect, useMemo} from 'react'

export interface DebounceHookChangeSettings {
  /**
   * When the parameters (ie, the wait duration or any settings) are changed or the hook
   * is unmounted, any pending trailing calls must be handled to avoid potential memory
   * leaks. This parameter controls the handling strategy. This only has effect if
   * `trailing` is `true`.
   *
   * Options are:
   *
   * - `flush` (default): Call pending calls immediately. May result in occasionally calling
   *   more often than expected. This is the safest way to avoid losing data. If the callback
   *   is async, care must be taken not to set state or perform other actions if not mounted
   *   after awaiting.
   * - `cancel`: Cancel pending calls. May result in dropping calls.
   */
  onChangeBehavior?: 'flush' | 'cancel'
}

export type UseDebounceSettings = DebounceSettings & DebounceHookChangeSettings

/**
 * Get a debounced version of the provided function. A debounced function will wait to be
 * called until `waitMs` milliseconds have passed since the last invocation. The result of
 * this hook is referentially stable with respect to `fn`, but will change if the other
 * parameters change.
 *
 * @see {@link debounce Lodash's debounce docs} for more details on available options.
 */
export const useDebounce = <Fn extends (...args: never[]) => unknown>(
  fn: Fn,
  waitMs: number,
  {leading = false, maxWait, trailing = true, onChangeBehavior = 'flush'}: UseDebounceSettings = {},
): DebouncedFunc<Fn> => {
  const fnRef = useTrackingRef(fn)

  const debouncedFn = useMemo(() => {
    // It's not enough to set `maxWait` to `undefined` in the options object - it needs to not be `in`
    // the object at all. See: https://github.com/lodash/lodash/issues/5495
    // For `leading` and `trailing` we default to the default boolean values so they are fine.
    const options = maxWait === undefined ? {leading, trailing} : {leading, trailing, maxWait}

    // eslint-disable-next-line react-hooks/refs
    return debounce((...args: Parameters<typeof fnRef.current>) => fnRef.current(...args), waitMs, options)
  }, [fnRef, waitMs, leading, maxWait, trailing])

  useEffect(
    () => () => {
      debouncedFn?.[onChangeBehavior]()
    },
    [debouncedFn, onChangeBehavior],
  )

  return debouncedFn
}

import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {useMemo} from 'react'

/**
 * Hook to get the SSO payload from the app payload
 *
 * @description If the app payload is not available, this hook will still return
 * an object with empty arrays for the SSO organizations and the default URLs
 *
 * @returns {SsoPayload} The SSO payload
 */
export const useSso = () => {
  const payload = useAppPayload<SsoAppPayload>()
  const ssoPayload = useMemo(() => {
    const ssoOrgs = payload?.sso_organizations ?? []
    const baseAvatarUrl = payload?.base_avatar_url ?? 'https://avatars.githubusercontent.com'
    return {ssoOrgs, baseAvatarUrl}
  }, [payload?.sso_organizations, payload?.base_avatar_url])

  return ssoPayload
}

export type SsoAppPayload = {
  base_avatar_url: string
  sso_organizations: Array<{[key: string]: string}>
}
}
		}
