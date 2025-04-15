"use client"

import { useState } from "react"
import { Mail, CheckCircle } from "lucide-react"

interface EmailVerificationProps {
  email: string
  onContinue: () => void
}

export function EmailVerification({ email, onContinue }: EmailVerificationProps) {
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSendVerification = () => {
    setIsSending(true)

    // Simulate sending verification email
    setTimeout(() => {
      setIsSending(false)
      setIsSent(true)
    }, 1500)
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-center mb-2">Verify Your Email</h3>

      <p className="text-center text-gray-600 mb-6">
        Your guide will be sent to <span className="font-semibold">{email}</span>
      </p>

      {!isSent ? (
        <button
          onClick={handleSendVerification}
          disabled={isSending}
          className="w-full cta-button py-3 mb-4 flex justify-center items-center"
        >
          {isSending ? (
            <>
              <span className="animate-spin h-5 w-5 mr-2 border-t-2 border-white rounded-full"></span>
              Sending...
            </>
          ) : (
            "Send Verification Email"
          )}
        </button>
      ) : (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4 flex items-start">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-green-800">
            Verification email sent! Please check your inbox and click the link to verify your email.
          </p>
        </div>
      )}

      <button onClick={onContinue} className="w-full secondary-button py-3">
        {isSent ? "I've Verified My Email" : "I'll Verify Later"}
      </button>

      {isSent && (
        <p className="text-xs text-gray-500 text-center mt-4">
          Didn't receive the email? Check your spam folder or click "I'll Verify Later" to continue.
        </p>
      )}
    </div>
  )
}
