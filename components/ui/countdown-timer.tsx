"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  minutes: number
  onComplete?: () => void
  className?: string
}

export function CountdownTimer({ minutes, onComplete, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60)

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onComplete) onComplete()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return <div className={`countdown-timer ${className}`}>{formatTime(timeLeft)}</div>
}
