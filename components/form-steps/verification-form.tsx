"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useFormContext } from "../form-context"
import { ProgressBar } from "../ui/progress-bar"
import { TrustIndicators } from "../ui/trust-indicators"

interface VerificationFormProps {
  onNext: () => void
  onBack: () => void
}

export function VerificationForm({ onNext, onBack }: VerificationFormProps) {
  const { formData, updateFormData } = useFormContext()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    // Simulate verification process
    const timer = setTimeout(() => {
      setIsVerifying(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.address?.trim()) {
      newErrors.address = "Address is required"
    }

    if (!formData.city?.trim()) {
      newErrors.city = "City is required"
    }

    if (!formData.state?.trim()) {
      newErrors.state = "State is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onNext()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    updateFormData({ [name]: value })

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  if (isVerifying) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Verifying your information...</h2>
        <p className="text-gray-600">Please wait while we process your details</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <ProgressBar currentStep={2} totalSteps={6} label="Profile 35% Complete" />

      <h2 className="text-2xl font-bold text-center mb-2">Verify Your Information</h2>

      <p className="text-center text-gray-600 mb-6">Please confirm your address to continue</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Street Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address || ""}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border ${errors.address ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Enter your street address"
          />
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city || ""}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border ${errors.city ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="City"
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              id="state"
              name="state"
              value={formData.state || ""}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border ${errors.state ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select State</option>
              <option value="AL">Alabama</option>
              <option value="AK">Alaska</option>
              <option value="AZ">Arizona</option>
              <option value="CA">California</option>
              <option value="CO">Colorado</option>
              <option value="FL">Florida</option>
              <option value="NY">New York</option>
              <option value="TX">Texas</option>
              {/* Add all states here */}
            </select>
            {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.formattedPhone || formData.phone || ""}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border ${errors.phone ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="(555) 123-4567"
            readOnly
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={onBack}
            className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
          >
            Back
          </button>

          <button
            type="submit"
            className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            CONTINUE
          </button>
        </div>
      </form>

      <TrustIndicators />

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm italic text-gray-700">
          "The job search guide helped me land interviews at 3 companies within a week!" - Recent User
        </p>
      </div>
    </div>
  )
}
