"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface PhoneVerificationProps {
  phone: string
  onVerified: () => void
  onCancel: () => void
}

export function PhoneVerification({ phone, onVerified, onCancel }: PhoneVerificationProps) {
  const [code, setCode] = useState(["", "", "", ""])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")
  const [timeLeft, setTimeLeft] = useState(60)
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  // Auto-focus next input
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1)
    }

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus()
    }

    // Clear error when user types
    if (error) setError("")
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handleVerify = () => {
    const enteredCode = code.join("")

    if (enteredCode.length !== 4) {
      setError("Please enter the complete 4-digit code")
      return
    }

    setIsVerifying(true)

    // Simulate verification
    setTimeout(() => {
      setIsVerifying(false)

      // For demo purposes, any code is valid
      setIsVerified(true)

      // Show success animation for 2 seconds before proceeding
      setTimeout(() => {
        onVerified()
      }, 2000)
    }, 1500)
  }

  const handleResendCode = () => {
    // Simulate sending a new code
    setTimeLeft(60)
    setError("")
    setCode(["", "", "", ""])
    inputRefs[0].current?.focus()
  }

  if (isVerified) {
    return (
      <div className="success-animation">
        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
          <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
        <h3 className="text-xl font-semibold text-green-600 mt-4">Phone Verified!</h3>
        <p className="text-gray-600 mt-2">Your phone number has been successfully verified.</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-center mb-4">Verify Your Phone</h3>

      <p className="text-gray-600 mb-4">
        We'll send a verification code to:{" "}
        <span className="font-medium">{phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}</span>
      </p>

      <div className="verification-code-input">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={isVerifying}
            autoFocus={index === 0}
          />
        ))}
      </div>

      {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

      <button
        onClick={handleVerify}
        disabled={isVerifying || code.some((digit) => !digit)}
        className="w-full cta-button py-3 mb-4 flex justify-center items-center"
      >
        {isVerifying ? (
          <>
            <span className="animate-spin h-5 w-5 mr-2 border-t-2 border-white rounded-full"></span>
            Verifying...
          </>
        ) : (
          "Verify Code"
        )}
      </button>

      <div className="text-center">
        {timeLeft > 0 ? (
          <p className="text-sm text-gray-500">
            Resend code in <span className="font-medium">{timeLeft}s</span>
          </p>
        ) : (
          <button onClick={handleResendCode} className="text-sm text-blue-600 hover:text-blue-800">
            Resend Code
          </button>
        )}
      </div>

      <button onClick={onCancel} className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700">
        I'll verify later
      </button>
    </div>
  )
}
