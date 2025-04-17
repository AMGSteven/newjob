"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useFormContext } from "../form-context"
import { ProgressBar } from "../ui/progress-bar"
import { CheckCircle, DollarSign } from "lucide-react"
import { progressiveLoad } from "@/utils/performance-utils"
import { LazyImage } from "../ui/lazy-image"

interface CreditCardDebtFormProps {
  onNext: () => void
  onBack: () => void
}

export function CreditCardDebtForm({ onNext, onBack }: CreditCardDebtFormProps) {
  const { formData, updateFormData, saveFieldProgress, logConsent } = useFormContext()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDebtFields, setShowDebtFields] = useState(false)
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
  }, [showDebtFields])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Only validate debt fields if user indicated they have debt
    if (showDebtFields) {
      if (!formData.creditCardDebt) {
        newErrors.creditCardDebt = "Please enter your credit card debt amount"
      }

      if (!formData.cardCount) {
        newErrors.cardCount = "Please select the number of cards"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Log the debt relief request
      logConsent("debt_relief_request", "User requested debt relief information")
      onNext()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target

    let processedValue = value
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    updateFormData({ [name]: processedValue })
    saveFieldProgress(name, processedValue)
  }

  const handleDebtResponse = (hasDebt: boolean) => {
    setShowDebtFields(hasDebt)
    updateFormData({ hasDebt })
    saveFieldProgress("hasDebt", hasDebt)

    if (!hasDebt) {
      // Clear debt-related fields if user doesn't have debt
      updateFormData({
        creditCardDebt: undefined,
        cardCount: undefined,
        interestRates: undefined,
        minimumPayments: undefined,
        missedPayments: undefined,
      })

      // Continue to next step
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
        <ProgressBar currentStep={5} totalSteps={6} label="Profile 85% Complete" />

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-1">Financial Relief During Job Transitions</h2>
          <p className="text-sm text-blue-700">
            Managing finances during job transitions can be challenging. Let us help you find relief options.
          </p>
        </div>
      </div>

      {!showDebtFields ? (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Do you have $5,000+ in credit card debt?</h3>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleDebtResponse(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Yes, I want to save money
            </button>

            <button
              type="button"
              onClick={() => handleDebtResponse(false)}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              No, I'm comfortable with my debt
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
                <span className="font-semibold">You may qualify for debt relief programs</span> that could reduce your
                payments by up to 50%
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="creditCardDebt" className="block text-sm font-medium text-gray-700 mb-1">
              How much credit card debt do you currently have?
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="creditCardDebt"
                name="creditCardDebt"
                value={formData.creditCardDebt || ""}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border ${errors.creditCardDebt ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select amount</option>
                <option value="5000">$5,000 - $9,999</option>
                <option value="10000">$10,000 - $14,999</option>
                <option value="15000">$15,000 - $19,999</option>
                <option value="20000">$20,000 - $24,999</option>
                <option value="25000">$25,000 - $29,999</option>
                <option value="30000">$30,000 - $39,999</option>
                <option value="40000">$40,000 - $49,999</option>
                <option value="50000">$50,000+</option>
              </select>
            </div>
            {errors.creditCardDebt && <p className="mt-1 text-sm text-red-600">{errors.creditCardDebt}</p>}
          </div>

          <div>
            <label htmlFor="cardCount" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Credit Cards
            </label>
            <select
              id="cardCount"
              name="cardCount"
              value={formData.cardCount || ""}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border ${errors.cardCount ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select number of cards</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5+</option>
            </select>
            {errors.cardCount && <p className="mt-1 text-sm text-red-600">{errors.cardCount}</p>}
          </div>

          <div>
            <label htmlFor="creditScore" className="block text-sm font-medium text-gray-700 mb-1">
              How is your credit?
            </label>
            <select
              id="creditScore"
              name="creditScore"
              value={formData.creditScore || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select credit score range</option>
              <option value="excellent">Excellent (720+)</option>
              <option value="good">Good (680-719)</option>
              <option value="fair">Fair (620-679)</option>
              <option value="poor">Poor (below 620)</option>
              <option value="unknown">I don't know</option>
            </select>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <LazyImage
                src="/placeholder.svg?height=40&width=40"
                alt="Customer"
                className="w-10 h-10 rounded-full mr-3"
                width={40}
                height={40}
              />
              <div>
                <p className="text-sm font-medium">Sarah from Phoenix, AZ</p>
                <p className="text-xs text-gray-500">2 weeks ago</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              "I was struggling with $18,500 in credit card debt. This program helped me reduce my monthly payments by
              $350. I wish I'd found it sooner!"
            </p>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => setShowDebtFields(false)}
              className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Back
            </button>

            <button
              type="submit"
              className="w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              SEE IF I QUALIFY
            </button>
          </div>
        </form>
      )}

      {!showDebtFields && (
        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={onBack}
            className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
          >
            Back
          </button>

          <button
            type="button"
            onClick={onNext}
            className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            CONTINUE
          </button>
        </div>
      )}

      <div
        ref={(el) => {
          if (el && !loadedSections.footer) {
            progressiveLoad(el, () => {
              setLoadedSections((prev) => ({ ...prev, footer: true }))
            })
          }
        }}
        className={`mt-6 p-4 bg-green-50 rounded-lg transition-opacity duration-300 ${loadedSections.footer ? "opacity-100" : "opacity-0"}`}
      >
        <p className="text-sm text-green-700">
          <span className="font-semibold">Almost there!</span> You're just one step away from accessing your
          personalized job search toolkit.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-center">
        <div className="flex items-center">
          <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xs text-gray-500">95% of job seekers complete this step</p>
        </div>
      </div>
    </div>
  )
}
