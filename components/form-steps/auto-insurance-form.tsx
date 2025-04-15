"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useFormContext } from "../form-context"
import { ProgressBar } from "../ui/progress-bar"
import { CheckCircle, Clock } from "lucide-react"
import { progressiveLoad } from "@/utils/performance-utils"

interface AutoInsuranceFormProps {
  onNext: () => void
  onBack: () => void
}

export function AutoInsuranceForm({ onNext, onBack }: AutoInsuranceFormProps) {
  const { formData, updateFormData, saveFieldProgress, logConsent } = useFormContext()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showInsuranceFields, setShowInsuranceFields] = useState(false)
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
  }, [showInsuranceFields])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (showInsuranceFields) {
      if (formData.hasAutoInsurance === undefined) {
        newErrors.hasAutoInsurance = "Please select an option"
      }

      if (formData.hasAutoInsurance && !formData.insuranceProvider) {
        newErrors.insuranceProvider = "Please select your current provider"
      }

      if (!formData.lastCompared) {
        newErrors.lastCompared = "Please select when you last compared rates"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Log the insurance quote request
      logConsent("insurance_quote_request", "User requested auto insurance quotes")
      onNext()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target

    if (type === "radio") {
      const radioInput = e.target as HTMLInputElement
      const boolValue = radioInput.value === "yes"
      updateFormData({ [name]: boolValue })
      saveFieldProgress(name, boolValue)
    } else {
      updateFormData({ [name]: value })
      saveFieldProgress(name, value)
    }

    // Clear error when user selects an option
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleInsuranceResponse = (wantsSavings: boolean) => {
    setShowInsuranceFields(wantsSavings)
    updateFormData({ wantsInsuranceSavings: wantsSavings })
    saveFieldProgress("wantsInsuranceSavings", wantsSavings)

    if (!wantsSavings) {
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
        <ProgressBar currentStep={4} totalSteps={6} label="Profile 70% Complete" />
      </div>

      {!showInsuranceFields ? (
        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-bold text-green-800 mb-1">Special Offer for Job Seekers</h2>
            <p className="text-base text-green-700">
              While you search for your next job, would you like to save up to $500 on car insurance?
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleInsuranceResponse(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Yes, I want to save money
            </button>

            <button
              type="button"
              onClick={() => handleInsuranceResponse(false)}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              No, I don't want to save money
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
                <span className="font-semibold">People with similar profiles save an average of $534/year</span> just by
                switching insurance providers
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="lastCompared" className="block text-sm font-medium text-gray-700 mb-1">
              When was the last time you compared auto insurance rates?
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="lastCompared"
                name="lastCompared"
                value={formData.lastCompared || ""}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border ${errors.lastCompared ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select timeframe</option>
                <option value="never">Never compared rates</option>
                <option value="over3years">Over 3 years ago</option>
                <option value="1to3years">1-3 years ago</option>
                <option value="6to12months">6-12 months ago</option>
                <option value="under6months">Less than 6 months ago</option>
              </select>
              {errors.lastCompared && <p className="mt-1 text-sm text-red-600">{errors.lastCompared}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Do you currently have auto insurance?
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="insurance-yes"
                  name="hasAutoInsurance"
                  type="radio"
                  value="yes"
                  checked={formData.hasAutoInsurance === true}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="insurance-yes" className="ml-3 text-sm text-gray-700">
                  Yes
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="insurance-no"
                  name="hasAutoInsurance"
                  type="radio"
                  value="no"
                  checked={formData.hasAutoInsurance === false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="insurance-no" className="ml-3 text-sm text-gray-700">
                  No
                </label>
              </div>
            </div>
            {errors.hasAutoInsurance && <p className="mt-1 text-sm text-red-600">{errors.hasAutoInsurance}</p>}
          </div>

          {formData.hasAutoInsurance && (
            <div>
              <label htmlFor="insuranceProvider" className="block text-sm font-medium text-gray-700 mb-1">
                Current Insurance Provider
              </label>
              <select
                id="insuranceProvider"
                name="insuranceProvider"
                value={formData.insuranceProvider || ""}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${errors.insuranceProvider ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select your provider</option>
                <option value="geico">Geico</option>
                <option value="progressive">Progressive</option>
                <option value="statefarm">State Farm</option>
                <option value="allstate">Allstate</option>
                <option value="liberty">Liberty Mutual</option>
                <option value="farmers">Farmers</option>
                <option value="nationwide">Nationwide</option>
                <option value="other">Other</option>
              </select>
              {errors.insuranceProvider && <p className="mt-1 text-sm text-red-600">{errors.insuranceProvider}</p>}
            </div>
          )}

          <div>
            <label htmlFor="vehicleYear" className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Year
            </label>
            <select
              id="vehicleYear"
              name="vehicleYear"
              value={formData.vehicleYear || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select year</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2019">2019</option>
              <option value="2018">2018</option>
              <option value="2017">2017</option>
              <option value="2016">2016</option>
              <option value="2015">2015</option>
              <option value="older">2014 or older</option>
            </select>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 text-white flex items-center justify-center font-bold mr-3">
                M
              </div>
              <div>
                <p className="text-sm font-medium">Michael from Dallas, TX</p>
                <p className="text-xs text-gray-500">1 month ago</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              "I hadn't compared rates in years. Took 2 minutes and saved $537 annually on my auto insurance!"
            </p>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => setShowInsuranceFields(false)}
              className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Back
            </button>

            <button
              type="submit"
              className="w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              GET MY FREE QUOTES
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Limited time offer!</span> Compare rates now before this offer expires.
          </p>
          <div className="text-blue-800 font-bold">3:42</div>
        </div>
      </div>
    </div>
  )
}
