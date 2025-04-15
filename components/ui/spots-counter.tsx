"use client"

import { useState, useEffect } from "react"

interface SpotsCounterProps {
  initialSpots?: number
  decrementInterval?: number
  className?: string
}

export function SpotsCounter({ initialSpots = 17, decrementInterval = 30000, className = "" }: SpotsCounterProps) {
  const [spotsLeft, setSpotsLeft] = useState(initialSpots)

  useEffect(() => {
    const timer = setInterval(() => {
      setSpotsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 1
        }
        return prev - 1
      })
    }, decrementInterval)

    return () => clearInterval(timer)
  }, [decrementInterval])

  return (
    <div className={`spots-counter ${className}`}>
      <span className="font-bold">Only {spotsLeft} spots remaining today!</span> Apply now before they're gone.
    </div>
  )
}
