import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // No SSR here (pure client-side Vite app), so `window` is always available —
  // compute the initial value synchronously instead of via an effect-driven setState.
  const [isMobile, setIsMobile] = React.useState<boolean>(() => window.innerWidth < MOBILE_BREAKPOINT)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
