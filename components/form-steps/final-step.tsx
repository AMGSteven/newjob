"use client"

import { useState, useEffect } from "react"
import { useFormContext } from "../form-context"
import { TrustIndicators } from "../ui/trust-indicators"
import { Logo } from "../ui/logo"

interface FinalStepProps {
  onRestart: () => void
}

export function FinalStep({ onRestart }: FinalStepProps) {
  const { formData, updateFormData, logConsent } = useFormContext()
  const [isProcessing, setIsProcessing] = useState(true)
  const [showDownload, setShowDownload] = useState(false)
  const [showVerification, setShowVerification] = useState(false)

  useEffect(() => {
    // Mark form as completed
    updateFormData({ formCompleted: true })

    // Simulate processing
    const processingTimer = setTimeout(() => {
      setIsProcessing(false)

      // Skip verification and go straight to download
      setShowDownload(true)
    }, 3000)

    return () => clearTimeout(processingTimer)
  }, [])

  const handleVerifyPhone = () => {
    // Simulate phone verification
    setShowVerification(false)
    setIsProcessing(true)

    setTimeout(() => {
      setIsProcessing(false)
      setShowDownload(true)
    }, 2000)
  }

  const handleDownload = () => {
    // Log the download action
    logConsent("resource_download", "User downloaded job search toolkit")

    // In a real implementation, this would trigger the actual download
    alert("Your job search toolkit would be downloaded in a real implementation.")
  }

  if (isProcessing) {
    return (
      <div className="max-w-md mx-auto text-center py-12 relative">
        <div className="absolute top-0 left-0">
          <Logo width={150} height={45} />
        </div>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4 mt-8"></div>
        <h2 className="text-xl font-semibold mb-2">Preparing Your Resources</h2>
        <p className="text-gray-600">Please wait while we customize your job search toolkit...</p>
      </div>
    )
  }

  if (showVerification) {
    return (
      <div className="max-w-md mx-auto relative">
        <div className="absolute top-0 left-0">
          <Logo width={150} height={45} />
        </div>
        <div className="pt-12">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-1">One Final Step</h2>
            <p className="text-sm text-blue-700">
              Verify your phone number to unlock premium content in your job search toolkit.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Verify Your Phone Number</h3>

            <p className="text-gray-600 mb-4">
              We'll send a verification code to:{" "}
              <span className="font-medium">
                {formData.formattedPhone || formData.phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
              </span>
            </p>

            <button
              onClick={handleVerifyPhone}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mb-4"
            >
              SEND VERIFICATION CODE
            </button>

            <p className="text-xs text-gray-500 text-center">Standard message and data rates may apply.</p>
          </div>

          <TrustIndicators />
        </div>
      </div>
    )
  }

  if (showDownload) {
    return (
      <div className="max-w-md mx-auto relative">
        <div className="absolute top-0 left-0">
          <Logo width={150} height={45} />
        </div>
        <div className="pt-12">
          <div className="bg-green-50 border border-green-200 p-6 rounded-lg mb-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Congratulations, {formData.firstName}!</h2>
            <p className="text-green-700 mb-4">Your Job Search Toolkit is ready for download</p>

            <button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              DOWNLOAD NOW
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recommended Partners</h3>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <h4 className="font-medium text-blue-600">Resume Review Service</h4>
                <p className="text-sm text-gray-600">Get professional feedback on your resume within 24 hours.</p>
              </div>

              <div className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <h4 className="font-medium text-blue-600">Interview Coaching</h4>
                <p className="text-sm text-gray-600">Practice with industry experts and get personalized feedback.</p>
              </div>

              <div className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <h4 className="font-medium text-blue-600">Career Counseling</h4>
                <p className="text-sm text-gray-600">One-on-one guidance to help you navigate your job search.</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button onClick={onRestart} className="text-blue-600 hover:text-blue-800 font-medium">
              Start Over
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
