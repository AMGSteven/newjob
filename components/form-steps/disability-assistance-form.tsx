"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useFormContext } from "../form-context"
import { ProgressBar } from "../ui/progress-bar"
import { CheckCircle, DollarSign } from "lucide-react"
import { progressiveLoad } from "@/utils/performance-utils"

interface DisabilityAssistanceFormProps {
  onNext: () => void
  onBack: () => void
}

export function DisabilityAssistanceForm({ onNext, onBack }: DisabilityAssistanceFormProps) {
  const { formData, updateFormData, saveFieldProgress, logConsent } = useFormContext()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDisabilityFields, setShowDisabilityFields] = useState(false)
  const [loadedSections, setLoadedSections] = useState({
    header: false,
    form: false,
    footer: false,
  })
  const formRef = useRef<HTMLFormElement>(null)

  // Progressive loading of form sections
  useEffect(() => {
    if (formRef.current) {
      progressiveLoad(formRef.current, () => {
        setLoadedSections((prev) => ({ ...prev, form: true }))
      })
    }
  }, [showDisabilityFields])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (showDisabilityFields) {
      if (!formData.conditionType) {
        newErrors.conditionType = "Please select your condition type"
      }

      if (!formData.conditionDuration) {
        newErrors.conditionDuration = "Please select how long you've had the condition"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Log the disability assistance request
      logConsent("disability_assistance_request", "User requested disability assistance information")
      onNext()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    updateFormData({ [name]: value })
    saveFieldProgress(name, value)

    // Clear error when user selects an option
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleDisabilityResponse = (hasDisability: boolean) => {
    setShowDisabilityFields(hasDisability)
    updateFormData({ hasDisability })
    saveFieldProgress("hasDisability", hasDisability)

    if (!hasDisability) {
      onNext()
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div
        ref={(el) => {
          if (el && !loadedSections.header) {
            progressiveLoad(el, () => {
              setLoadedSections((prev) => ({ ...prev, header: true }))
            })
          }
        }}
        className={`transition-opacity duration-300 ${loadedSections.header ? "opacity-100" : "opacity-0"}`}
      >
        <ProgressBar currentStep={9} totalSteps={12} label="Profile 75% Complete" />

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-1">
            Unable To Work? You May Qualify For $1,259/Month In Benefits
          </h2>
          <p className="text-sm text-blue-700">
            Social Security Disability benefits can provide financial support if you're unable to work due to a medical
            condition.
          </p>
        </div>
      </div>

      {!showDisabilityFields ? (
        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-bold text-green-800 mb-1">Disability Assistance</h2>
            <p className="text-base text-green-700">Do you have a medical condition that prevents you from working?</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleDisabilityResponse(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Yes, I have a disability
            </button>

            <button
              type="button"
              onClick={() => handleDisabilityResponse(false)}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              No, I don't have a disability
            </button>
          </div>
        </div>
      ) : (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={`space-y-4 transition-opacity duration-300 ${loadedSections.form ? "opacity-100" : "opacity-0"}`}
        >
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-1 mr-2 flex-shrink-0" />
              <p className="text-sm text-green-800">
                <span className="font-semibold">The average SSDI benefit is $1,259 per month</span> and you may qualify
                for back pay
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="conditionType" className="block text-sm font-medium text-gray-700 mb-1">
              Nature of Your Condition
            </label>
            <select
              id="conditionType"
              name="conditionType"
              value={formData.conditionType || ""}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border ${errors.conditionType ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select condition type</option>
              <option value="physical">Physical disability</option>
              <option value="mental">Mental health condition</option>
              <option value="both">Both physical and mental conditions</option>
              <option value="other">Other medical condition</option>
            </select>
            {errors.conditionType && <p className="mt-1 text-sm text-red-600">{errors.conditionType}</p>}
          </div>

          <div>
            <label htmlFor="conditionDuration" className="block text-sm font-medium text-gray-700 mb-1">
              How Long Have You Had This Condition?
            </label>
            <select
              id="conditionDuration"
              name="conditionDuration"
              value={formData.conditionDuration || ""}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border ${errors.conditionDuration ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select duration</option>
              <option value="less_than_3_months">Less than 3 months</option>
              <option value="3_to_6_months">3-6 months</option>
              <option value="6_to_12_months">6-12 months</option>
              <option value="1_to_2_years">1-2 years</option>
              <option value="more_than_2_years">More than 2 years</option>
            </select>
            {errors.conditionDuration && <p className="mt-1 text-sm text-red-600">{errors.conditionDuration}</p>}
          </div>

          <div>
            <label htmlFor="appliedBefore" className="block text-sm font-medium text-gray-700 mb-1">
              Have You Applied for Disability Benefits Before?
            </label>
            <select
              id="appliedBefore"
              name="appliedBefore"
              value={formData.appliedBefore || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an option</option>
              <option value="never">Never applied</option>
              <option value="applied_denied">Applied but was denied</option>
              <option value="applied_pending">Applied and decision is pending</option>
              <option value="receiving">Currently receiving benefits</option>
            </select>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold mr-3">
                R
              </div>
              <div>
                <p className="text-sm font-medium">Robert from Chicago, IL</p>
                <p className="text-xs text-gray-500">3 weeks ago</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              "I was denied twice on my own. With professional help, I was approved and received $17,500 in back pay."
            </p>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => setShowDisabilityFields(false)}
              className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Back
            </button>

            <button
              type="submit"
              className="w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              CHECK MY ELIGIBILITY
            </button>
          </div>
        </form>
      )}

      <div
        ref={(el) => {
          if (el && !loadedSections.footer) {
            progressiveLoad(el, () => {
              setLoadedSections((prev) => ({ ...prev, footer: true }))
            })
          }
        }}
        className={`mt-6 p-4 bg-blue-50 rounded-lg transition-opacity duration-300 ${loadedSections.footer ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex items-center">
          <DollarSign className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Did you know?</span> Over 70% of initial disability applications are denied,
            but many are approved with professional help.
          </p>
        </div>
      </div>
    </div>
  )
}
