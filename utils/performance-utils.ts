// Utility functions for performance optimization

// Detect if IntersectionObserver is supported
export const hasIntersectionObserver = typeof IntersectionObserver !== "undefined"

// Progressive loading helper
export function progressiveLoad(element: HTMLElement, callback: () => void, options = {}) {
  if (hasIntersectionObserver) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback()
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: "200px", // Load when within 200px of viewport
        threshold: 0.1,
        ...options,
      },
    )

    observer.observe(element)
    return () => observer.disconnect()
  } else {
    // Fallback for browsers without IntersectionObserver
    setTimeout(callback, 100)
    return () => {}
  }
}

// Preload critical resources
export function preloadCriticalResources() {
  if (typeof document === "undefined") return

  // Preload next step resources
  const preloadLinks = [
    // Add critical resources here
    { rel: "preload", href: "/placeholder.svg", as: "image" },
  ]

  preloadLinks.forEach((link) => {
    const linkElement = document.createElement("link")
    linkElement.rel = link.rel
    linkElement.href = link.href
    linkElement.as = link.as
    document.head.appendChild(linkElement)
  })
}

// Defer non-critical JavaScript - FIXED FUNCTION
export function deferNonCriticalJS(src: string) {
  if (typeof document === "undefined") return

  const script = document.createElement("script")
  script.src = src
  script.defer = true
  document.body.appendChild(script)
  // Removed problematic comment that was causing parsing issues
}

// Monitor Core Web Vitals
export function monitorWebVitals() {
  // Simple monitoring without external dependencies
  if (typeof window !== "undefined" && typeof PerformanceObserver !== "undefined") {
    try {
      // Listen for the largest contentful paint
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1]
          console.log("LCP:", lastEntry.startTime / 1000)
        }
      })

      observer.observe({ type: "largest-contentful-paint", buffered: true })
    } catch (e) {
      console.error("Performance monitoring error:", e)
    }
  }
}
