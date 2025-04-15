"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useFormContext } from "../form-context"
import { ProgressBar } from "../ui/progress-bar"
import { TrustIndicators } from "../ui/trust-indicators"
import { SocialProof } from "../ui/social-proof"
import { QRCode } from "../ui/qr-code"
import { progressiveLoad } from "@/utils/performance-utils"
import { Logo } from "../ui/logo"
import { SecurityBadges } from "../ui/security-badges"
import { MediaLogos } from "../ui/media-logos"
import { CountdownTimer } from "../ui/countdown-timer"
import { SpotsCounter } from "../ui/spots-counter"
import { RecentActivity } from "../ui/recent-activity"
import { CheckCircle, Lock } from "lucide-react"
import { formatPhoneNumber, getRawPhoneNumber, isValidPhoneNumber } from "@/utils/format-utils"

interface InitialFormProps {
  onNext: () => void
}

export function InitialForm({ onNext }: InitialFormProps) {
  const { formData, updateFormData, saveFieldProgress, logConsent, getTcpaLanguage, generateContinuationLink } =
    useFormContext()

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tcpaConsent, setTcpaConsent] = useState(true)
  const [isReturningUser, setIsReturningUser] = useState(false)
  const [tcpaText, setTcpaText] = useState("")
  const [showContinuationOptions, setShowContinuationOptions] = useState(false)
  const [continuationLink, setContinuationLink] = useState("")
  const [fieldValidation, setFieldValidation] = useState<Record<string, boolean>>({})
  const formRef = useRef<HTMLFormElement>(null)

  // Progressive loading of form elements
  const [loadedSections, setLoadedSections] = useState({
    form: false,
    socialProof: false,
    trustIndicators: false,
  })

  // Check if user is returning with saved data and get dynamic TCPA text
  useEffect(() => {
    const savedData = localStorage.getItem("formData")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        if (parsedData.firstName || parsedData.email) {
          setIsReturningUser(true)
        }
      } catch (e) {
        console.error("Error parsing saved form data", e)
      }
    }

    // Get dynamic TCPA language based on location
    setTcpaText(getTcpaLanguage())

    // Generate continuation link
    setContinuationLink(generateContinuationLink(1))

    // Progressive loading of form sections
    if (formRef.current) {
      progressiveLoad(formRef.current, () => {
        setLoadedSections((prev) => ({ ...prev, form: true }))
      })
    }
  }, [])

  const validateField = (name: string, value: string): boolean => {
    switch (name) {
      case "firstName":
      case "lastName":
        return value.trim().length > 0
      case "email":
        return /\S+@\S+\.\S+/.test(value)
      case "phone":
        return /^\d{10}$/.test(value.replace(/\D/g, ""))
      case "zipCode":
        return /^\d{5}(-\d{4})?$/.test(value)
      default:
        return true
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!isValidPhoneNumber(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits"
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required"
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = "ZIP code is invalid"
    }

    if (!tcpaConsent) {
      newErrors.tcpaConsent = "You must agree to the terms"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Save TCPA consent
      updateFormData({ tcpaConsent })

      // Log consent with compliance service
      logConsent("initial_form_submit", tcpaText)

      // Simulate a brief loading state before proceeding
      setTimeout(() => {
        onNext()
      }, 500)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    updateFormData({ [name]: value })

    // Save field progress in real-time
    saveFieldProgress(name, value)

    // Validate field in real-time
    const isValid = validateField(name, value)
    setFieldValidation((prev) => ({
      ...prev,
      [name]: isValid,
    }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // Show continuation options if we have email or phone
    if ((name === "email" || name === "phone") && value) {
      setShowContinuationOptions(true)
    }
  }

  // Send continuation link via email/SMS
  const sendContinuationLink = (method: "email" | "sms") => {
    // In a real implementation, this would call an API to send the link
    console.log(`Sending continuation link via ${method} to ${method === "email" ? formData.email : formData.phone}`)
    alert(`Continuation link would be sent to your ${method === "email" ? "email" : "phone"} in a real implementation.`)
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="absolute top-2 left-4">
        <Logo width={150} height={50} />
      </div>

      {isReturningUser && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 mt-12">
          <h3 className="text-lg font-semibold text-blue-800 mb-1">
            Welcome Back{formData.firstName ? `, ${formData.firstName}` : ""}!
          </h3>
          <p className="text-sm text-blue-700">We saved your information so you can continue where you left off.</p>
        </div>
      )}

      <div className="bg-yellow-100 text-yellow-800 text-center py-2 px-4 rounded-lg mb-6 mt-12">
        <div className="flex justify-between items-center">
          <span className="font-bold">Free Career Guide - Limited Time Offer</span>
          <CountdownTimer minutes={5} className="font-mono" />
        </div>
      </div>

      <ProgressBar currentStep={1} totalSteps={12} />

      <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-800">
        Get Your Free Career Guide & Job Search Toolkit
      </h1>

      <p className="text-center text-gray-600 mb-6">
        Join 50,000+ job seekers who found better opportunities using our proven resources
      </p>

      <MediaLogos className="mb-6" />

      <SpotsCounter initialSpots={17} className="mb-6" />

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className={`transition-opacity duration-300 ${loadedSections.form ? "opacity-100" : "opacity-0"}`}>
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${errors.firstName ? "border-red-500" : fieldValidation.firstName ? "border-green-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter your first name"
              />
              {fieldValidation.firstName && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
          </div>

          <div className="mt-4">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${errors.lastName ? "border-red-500" : fieldValidation.lastName ? "border-green-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter your last name"
              />
              {fieldValidation.lastName && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
          </div>

          <div className="mt-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${errors.email ? "border-red-500" : fieldValidation.email ? "border-green-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter your email address"
              />
              {fieldValidation.email && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div className="mt-4">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.formattedPhone || formData.phone || ""}
                onChange={(e) => {
                  const formattedValue = formatPhoneNumber(e.target.value)
                  const rawValue = getRawPhoneNumber(e.target.value)

                  // Update both the raw and formatted values
                  updateFormData({
                    phone: rawValue,
                    formattedPhone: formattedValue,
                  })

                  // Validate the phone number
                  const isValid = isValidPhoneNumber(e.target.value)
                  setFieldValidation((prev) => ({
                    ...prev,
                    phone: isValid,
                  }))

                  // Clear error when user types
                  if (errors.phone) {
                    setErrors((prev) => {
                      const newErrors = { ...prev }
                      delete newErrors.phone
                      return newErrors
                    })
                  }

                  // Show continuation options if we have email or phone
                  if (rawValue) {
                    setShowContinuationOptions(true)
                  }
                }}
                className={`w-full px-4 py-3 border ${errors.phone ? "border-red-500" : fieldValidation.phone ? "border-green-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="(555) 123-4567"
                maxLength={14}
              />
              {fieldValidation.phone && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            <p className="mt-1 text-xs text-gray-500 flex items-center">
              <Lock className="h-3 w-3 mr-1" />
              We'll send a verification code to confirm your number
            </p>
          </div>

          <div className="mt-4">
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code
            </label>
            <div className="relative">
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${errors.zipCode ? "border-red-500" : fieldValidation.zipCode ? "border-green-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter your ZIP code"
              />
              {fieldValidation.zipCode && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
            {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
          </div>

          <div className="flex items-start mt-4">
            <div className="flex items-center h-5">
              <input
                id="tcpaConsent"
                name="tcpaConsent"
                type="checkbox"
                checked={tcpaConsent}
                onChange={() => setTcpaConsent(!tcpaConsent)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="tcpaConsent"
                className={`font-medium ${errors.tcpaConsent ? "text-red-600" : "text-gray-500"}`}
              >
                {tcpaText}
              </label>
              {errors.tcpaConsent && <p className="mt-1 text-sm text-red-600">{errors.tcpaConsent}</p>}
            </div>
          </div>

          <button
            type="submit"
            className="w-full cta-button py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 pulse-animation mt-4"
          >
            GET MY FREE GUIDE
          </button>
        </div>
      </form>

      {/* Cross-device continuation options */}
      {showContinuationOptions && (
        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Continue on another device?</h4>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <button
                onClick={() => sendContinuationLink("email")}
                className="w-full text-sm bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 font-medium py-2 px-3 rounded-md"
                disabled={!formData.email}
              >
                Email me a link
              </button>

              <button
                onClick={() => sendContinuationLink("sms")}
                className="w-full text-sm bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 font-medium py-2 px-3 rounded-md mt-2"
                disabled={!formData.phone}
              >
                Text me a link
              </button>
            </div>

            <div className="flex-1 flex justify-center">
              {/* Wrap QR code in error boundary */}
              <div className="qr-code-container">
                <QRCode currentStep={1} size={100} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        ref={(el) => {
          if (el && !loadedSections.trustIndicators) {
            progressiveLoad(el, () => {
              setLoadedSections((prev) => ({ ...prev, trustIndicators: true }))
            })
          }
        }}
        className={`transition-opacity duration-300 ${loadedSections.trustIndicators ? "opacity-100" : "opacity-0"}`}
      >
        <TrustIndicators />
      </div>

      <div
        ref={(el) => {
          if (el && !loadedSections.socialProof) {
            progressiveLoad(el, () => {
              setLoadedSections((prev) => ({ ...prev, socialProof: true }))
            })
          }
        }}
        className={`transition-opacity duration-300 ${loadedSections.socialProof ? "opacity-100" : "opacity-0"}`}
      >
        <SocialProof />
      </div>

      <SecurityBadges className="mt-6" />

      <p className="text-center text-xs text-gray-500 mt-6">
        Over 15,000 people found better jobs using our resources last month
      </p>

      <div className="mt-4 flex items-center justify-center">
        <div className="flex items-center">
          <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xs text-gray-500">Secure & Confidential</p>
        </div>
      </div>

      <RecentActivity interval={10000} />
    </div>
  )
}
