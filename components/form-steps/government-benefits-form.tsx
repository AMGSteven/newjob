"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useFormContext } from "../form-context"
import { ProgressBar } from "../ui/progress-bar"
import { CheckCircle, Users } from "lucide-react"
import { progressiveLoad } from "@/utils/performance-utils"
import { LazyImage } from "../ui/lazy-image"

interface GovernmentBenefitsFormProps {
  onNext: () => void
  onBack: () => void
}

export function GovernmentBenefitsForm({ onNext, onBack }: GovernmentBenefitsFormProps) {
  const { formData, updateFormData, saveFieldProgress, logConsent } = useFormContext()
  const [errors, setErrors] = useState<Record<string, string>>({})
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
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.householdSize) {
      newErrors.householdSize = "Please select your household size"
    }

    if (!formData.annualIncome) {
      newErrors.annualIncome = "Please select your annual income range"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Log the benefits check
      logConsent("government_benefits_check", "User checked eligibility for government benefits")
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    updateFormData({ [name]: checked })
    saveFieldProgress(name, checked)
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
        <ProgressBar currentStep={7} totalSteps={12} label="Profile 58% Complete" />

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-1">
            You May Qualify For Benefits You Don't Know About
          </h2>
          <p className="text-sm text-blue-700">
            Millions of Americans miss out on benefits they're eligible for. Let's check what you qualify for.
          </p>
        </div>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={`space-y-4 transition-opacity duration-300 ${loadedSections.form ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <LazyImage
            src="/placeholder.svg?height=50&width=50"
            alt="SNAP"
            className="h-12 w-12"
            width={50}
            height={50}
          />
          <LazyImage
            src="/placeholder.svg?height=50&width=50"
            alt="Utility Assistance"
            className="h-12 w-12"
            width={50}
            height={50}
          />
          <LazyImage
            src="/placeholder.svg?height=50&width=50"
            alt="Housing Assistance"
            className="h-12 w-12"
            width={50}
            height={50}
          />
          <LazyImage
            src="/placeholder.svg?height=50&width=50"
            alt="Healthcare"
            className="h-12 w-12"
            width={50}
            height={50}
          />
        </div>

        <div>
          <label htmlFor="householdSize" className="block text-sm font-medium text-gray-700 mb-1">
            Household Size
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="householdSize"
              name="householdSize"
              value={formData.householdSize || ""}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border ${errors.householdSize ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select household size</option>
              <option value="1">1 person</option>
              <option value="2">2 people</option>
              <option value="3">3 people</option>
              <option value="4">4 people</option>
              <option value="5">5 people</option>
              <option value="6">6+ people</option>
            </select>
            {errors.householdSize && <p className="mt-1 text-sm text-red-600">{errors.householdSize}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="annualIncome" className="block text-sm font-medium text-gray-700 mb-1">
            Annual Household Income
          </label>
          <select
            id="annualIncome"
            name="annualIncome"
            value={formData.annualIncome || ""}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border ${errors.annualIncome ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Select income range</option>
            <option value="0_15000">$0 - $15,000</option>
            <option value="15000_30000">$15,000 - $30,000</option>
            <option value="30000_45000">$30,000 - $45,000</option>
            <option value="45000_60000">$45,000 - $60,000</option>
            <option value="60000_75000">$60,000 - $75,000</option>
            <option value="75000_plus">$75,000+</option>
          </select>
          {errors.annualIncome && <p className="mt-1 text-sm text-red-600">{errors.annualIncome}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Do you currently participate in any of these programs? (Select all that apply)
          </label>
          <div className="space-y-2">
            <div className="flex items-start">
              <input
                id="snap"
                name="participatesInSNAP"
                type="checkbox"
                checked={formData.participatesInSNAP || false}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <label htmlFor="snap" className="ml-3 text-sm text-gray-700">
                SNAP (Food Stamps)
              </label>
            </div>

            <div className="flex items-start">
              <input
                id="medicaid"
                name="participatesInMedicaid"
                type="checkbox"
                checked={formData.participatesInMedicaid || false}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <label htmlFor="medicaid" className="ml-3 text-sm text-gray-700">
                Medicaid
              </label>
            </div>

            <div className="flex items-start">
              <input
                id="tanf"
                name="participatesInTANF"
                type="checkbox"
                checked={formData.participatesInTANF || false}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <label htmlFor="tanf" className="ml-3 text-sm text-gray-700">
                TANF (Cash Assistance)
              </label>
            </div>

            <div className="flex items-start">
              <input
                id="housing"
                name="participatesInHousing"
                type="checkbox"
                checked={formData.participatesInHousing || false}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <label htmlFor="housing" className="ml-3 text-sm text-gray-700">
                Housing Assistance (Section 8)
              </label>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mt-1 mr-2 flex-shrink-0" />
            <p className="text-sm text-green-800">
              <span className="font-semibold">Based on your information, you may qualify for up to $1,827/month</span>{" "}
              in combined benefits
            </p>
          </div>
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
            className="w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            CHECK MY ELIGIBILITY
          </button>
        </div>
      </form>

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
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Did you know?</span> Over 60% of eligible Americans miss out on benefits they
          qualify for.
        </p>
      </div>
    </div>
  )
}
