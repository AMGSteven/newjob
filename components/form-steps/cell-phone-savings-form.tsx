"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useFormContext } from "../form-context"
import { ProgressBar } from "../ui/progress-bar"
import { CheckCircle, Smartphone } from "lucide-react"
import { progressiveLoad } from "@/utils/performance-utils"

interface CellPhoneSavingsFormProps {
  onNext: () => void
  onBack: () => void
}

export function CellPhoneSavingsForm({ onNext, onBack }: CellPhoneSavingsFormProps) {
  const { formData, updateFormData, saveFieldProgress, logConsent } = useFormContext()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPhoneFields, setShowPhoneFields] = useState(false)
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
  }, [showPhoneFields])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (showPhoneFields) {
      if (!formData.currentPhoneProvider) {
        newErrors.currentPhoneProvider = "Please select your current provider"
      }

      if (!formData.monthlyPhoneBill) {
        newErrors.monthlyPhoneBill = "Please select your monthly bill amount"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Log the phone savings request
      logConsent("cell_phone_savings_request", "User requested cell phone savings information")
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

  const handlePhoneResponse = (wantsPhoneSavings: boolean) => {
    setShowPhoneFields(wantsPhoneSavings)
    updateFormData({ wantsPhoneSavings })
    saveFieldProgress("wantsPhoneSavings", wantsPhoneSavings)

    if (!wantsPhoneSavings) {
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
        <ProgressBar currentStep={11} totalSteps={12} label="Profile 92% Complete" />

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-1">
            You May Qualify For A Free Smartphone And Service
          </h2>
          <p className="text-sm text-blue-700">
            Government programs can provide free or discounted phone service to eligible households.
          </p>
        </div>
      </div>

      {!showPhoneFields ? (
        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-bold text-green-800 mb-1">Cell Phone Savings Programs</h2>
            <p className="text-base text-green-700">
              Would you like to see if you qualify for free or discounted phone service?
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handlePhoneResponse(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Yes, check my eligibility
            </button>

            <button
              type="button"
              onClick={() => handlePhoneResponse(false)}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              No, I'm not interested
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
                <span className="font-semibold">Government programs like Lifeline and ACP</span> can provide free
                smartphones and up to $30/month off your bill
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="currentPhoneProvider" className="block text-sm font-medium text-gray-700 mb-1">
              Current Cell Phone Provider
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Smartphone className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="currentPhoneProvider"
                name="currentPhoneProvider"
                value={formData.currentPhoneProvider || ""}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border ${errors.currentPhoneProvider ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select provider</option>
                <option value="verizon">Verizon</option>
                <option value="att">AT&T</option>
                <option value="tmobile">T-Mobile</option>
                <option value="sprint">Sprint</option>
                <option value="metro">Metro by T-Mobile</option>
                <option value="cricket">Cricket</option>
                <option value="boost">Boost Mobile</option>
                <option value="other">Other</option>
                <option value="none">No current service</option>
              </select>
              {errors.currentPhoneProvider && (
                <p className="mt-1 text-sm text-red-600">{errors.currentPhoneProvider}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="monthlyPhoneBill" className="block text-sm font-medium text-gray-700 mb-1">
              Current Monthly Phone Bill
            </label>
            <select
              id="monthlyPhoneBill"
              name="monthlyPhoneBill"
              value={formData.monthlyPhoneBill || ""}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border ${errors.monthlyPhoneBill ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select monthly amount</option>
              <option value="0_30">$0 - $30</option>
              <option value="30_50">$30 - $50</option>
              <option value="50_75">$50 - $75</option>
              <option value="75_100">$75 - $100</option>
              <option value="100_150">$100 - $150</option>
              <option value="150_plus">$150+</option>
              <option value="no_service">No current service</option>
            </select>
            {errors.monthlyPhoneBill && <p className="mt-1 text-sm text-red-600">{errors.monthlyPhoneBill}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Do any of these apply to you? (Select all that apply)
            </label>
            <div className="space-y-2">
              <div className="flex items-start">
                <input
                  id="snap-participant"
                  name="phoneSnapParticipant"
                  type="checkbox"
                  checked={formData.phoneSnapParticipant || formData.participatesInSNAP || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <label htmlFor="snap-participant" className="ml-3 text-sm text-gray-700">
                  SNAP (Food Stamps) participant
                </label>
              </div>

              <div className="flex items-start">
                <input
                  id="medicaid-participant"
                  name="phoneMedicaidParticipant"
                  type="checkbox"
                  checked={formData.phoneMedicaidParticipant || formData.participatesInMedicaid || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <label htmlFor="medicaid-participant" className="ml-3 text-sm text-gray-700">
                  Medicaid participant
                </label>
              </div>

              <div className="flex items-start">
                <input
                  id="low-income"
                  name="phoneLowIncome"
                  type="checkbox"
                  checked={formData.phoneLowIncome || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <label htmlFor="low-income" className="ml-3 text-sm text-gray-700">
                  Household income below $40,000
                </label>
              </div>

              <div className="flex items-start">
                <input
                  id="ssi-participant"
                  name="phoneSsiParticipant"
                  type="checkbox"
                  checked={formData.phoneSsiParticipant || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <label htmlFor="ssi-participant" className="ml-3 text-sm text-gray-700">
                  SSI or disability recipient
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => setShowPhoneFields(false)}
              className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Back
            </button>

            <button
              type="submit"
              className="w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              SEE MY PHONE OPTIONS
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
          <Smartphone className="h-5 w-5 text-blue-600 mr-2" />
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Government Program:</span> The Affordable Connectivity Program provides up
            to $30/month off internet or phone service.
          </p>
        </div>
      </div>
    </div>
  )
}
