"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { useFormContext } from "../form-context"

export function ExitIntentPopup() {
  const { formData, updateFormData } = useFormContext()
  const [showPopup, setShowPopup] = useState(false)
  const [email, setEmail] = useState("")
  const [exitAttempts, setExitAttempts] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [inactiveTime, setInactiveTime] = useState(0)
  const inactiveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Handle exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse moves toward the top of the page
      if (e.clientY <= 5) {
        triggerExitIntent()
      }
    }

    // Track user inactivity
    const resetInactiveTimer = () => {
      setInactiveTime(0)
      if (inactiveTimerRef.current) {
        clearInterval(inactiveTimerRef.current)
      }

      inactiveTimerRef.current = setInterval(() => {
        setInactiveTime((prev) => {
          // If inactive for 15 seconds on mobile, trigger exit intent
          if (prev >= 15 && window.innerWidth <= 768) {
            triggerExitIntent()
          }
          return prev + 1
        })
      }, 1000)
    }

    // Track tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && window.innerWidth <= 768) {
        triggerExitIntent()
      }
    }

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"]

    // Add event listeners
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    events.forEach((event) => {
      document.addEventListener(event, resetInactiveTimer)
    })

    // Start the inactive timer
    resetInactiveTimer()

    return () => {
      // Clean up event listeners
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      events.forEach((event) => {
        document.removeEventListener(event, resetInactiveTimer)
      })

      if (inactiveTimerRef.current) {
        clearInterval(inactiveTimerRef.current)
      }
    }
  }, [])

  // Countdown timer for urgency
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive, timeLeft])

  const triggerExitIntent = () => {
    // Don't show if already showing or if user has completed form
    if (showPopup || formData.formCompleted) return

    setExitAttempts((prev) => prev + 1)
    setShowPopup(true)
    setIsActive(true)

    // Save exit attempt count in localStorage
    localStorage.setItem("exitAttempts", String(exitAttempts + 1))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Save email for abandonment recovery
    if (email) {
      updateFormData({ email })
      localStorage.setItem("partialEmail", email)
    }

    setShowPopup(false)
  }

  const handleClose = () => {
    setShowPopup(false)
    setIsActive(false)

    // If this is the third exit attempt, show browser confirm dialog
    if (exitAttempts >= 2) {
      const confirmLeave = window.confirm("Are you sure? You're leaving $500 in potential savings on the table!")
      if (!confirmLeave) {
        setShowPopup(true)
        setIsActive(true)
      }
    }
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  if (!showPopup) return null

  // Different popups based on exit attempt count
  if (exitAttempts === 1) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative overflow-hidden">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="bg-red-600 p-4 text-white text-center">
            <h3 className="text-2xl font-bold">WAIT!</h3>
            <p className="text-lg">Don't miss your chance at a $75,000+ job opportunity!</p>
          </div>

          <div className="p-6">
            <div className="mb-4 text-center">
              <div className="text-sm font-semibold text-red-600 mb-1">LIMITED TIME OFFER</div>
              <div className="text-xl font-bold">{formatTime(timeLeft)}</div>
            </div>

            <p className="text-gray-700 mb-4">
              You're about to miss out on our exclusive job search toolkit that has helped thousands land their dream
              jobs!
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out pulse-animation"
              >
                YES, I WANT THE FREE GUIDE!
              </button>

              <button type="button" onClick={handleClose} className="w-full text-sm text-gray-500 hover:text-gray-700">
                No thanks, I don't want better job opportunities
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">This special bonus expires in {formatTime(timeLeft)}!</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Second exit attempt - simplified form
  if (exitAttempts === 2) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative overflow-hidden">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="bg-yellow-600 p-4 text-white text-center">
            <h3 className="text-xl font-bold">LAST CHANCE!</h3>
            <p>We'll send your job guide anyway</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Just your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out"
              >
                SEND ME THE GUIDE
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Third exit attempt - last chance message
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="bg-blue-600 p-4 text-white text-center">
          <h3 className="text-xl font-bold">Don't leave money on the table!</h3>
        </div>

        <div className="p-6 text-center">
          <p className="text-gray-700 mb-4">
            You're pre-qualified for debt relief programs that could save you hundreds per month!
          </p>

          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out mb-3"
          >
            SEE IF I QUALIFY
          </button>

          <button onClick={handleClose} className="text-sm text-gray-500 hover:text-gray-700">
            No thanks
          </button>
        </div>
      </div>
    </div>
  )
}
