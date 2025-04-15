"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useFormContext } from "../form-context"
import { ProgressBar } from "../ui/progress-bar"
import { CheckCircle, DollarSign } from "lucide-react"
import { progressiveLoad } from "@/utils/performance-utils"

interface TaxReliefFormProps {
  onNext: () => void
  onBack: () => void
}

export function TaxReliefForm({ onNext, onBack }: TaxReliefFormProps) {
  const { formData, updateFormData, saveFieldProgress, logConsent } = useFormContext()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showTaxFields, setShowTaxFields] = useState(false)
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
  }, [showTaxFields])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (showTaxFields) {
      if (!formData.taxDebtAmount) {
        newErrors.taxDebtAmount = "Please select your tax debt amount"
      }

      if (!formData.taxYearsOwed) {
        newErrors.taxYearsOwed = "Please select the years you owe taxes"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Log the tax relief request
      logConsent("tax_relief_request", "User requested tax relief information")
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

  const handleTaxResponse = (hasTaxDebt: boolean) => {
    setShowTaxFields(hasTaxDebt)
    updateFormData({ hasTaxDebt })
    saveFieldProgress("hasTaxDebt", hasTaxDebt)

    if (!hasTaxDebt) {
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
        <ProgressBar currentStep={10} totalSteps={12} label="Profile 83% Complete" />

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-1">Owe Taxes? Reduce What You Owe By Up To 50%</h2>
          <p className="text-sm text-blue-700">
            Tax relief programs can help you settle your tax debt for less than you owe.
          </p>
        </div>
      </div>

      {!showTaxFields ? (
        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-bold text-green-800 mb-1">Tax Relief Programs</h2>
            <p className="text-base text-green-700">Do you owe $10,000+ to the IRS or have unfiled tax returns?</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleTaxResponse(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Yes, I need tax help
            </button>

            <button
              type="button"
              onClick={() => handleTaxResponse(false)}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              No, I don't have tax issues
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
                <span className="font-semibold">Example Settlement:</span> $45,000 tax debt settled for $18,750 - a 58%
                reduction!
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="taxDebtAmount" className="block text-sm font-medium text-gray-700 mb-1">
              How Much Do You Owe in Tax Debt?
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="taxDebtAmount"
                name="taxDebtAmount"
                value={formData.taxDebtAmount || ""}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border ${errors.taxDebtAmount ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select amount</option>
                <option value="10000_15000">$10,000 - $15,000</option>
                <option value="15000_20000">$15,000 - $20,000</option>
                <option value="20000_30000">$20,000 - $30,000</option>
                <option value="30000_50000">$30,000 - $50,000</option>
                <option value="50000_plus">$50,000+</option>
                <option value="not_sure">Not sure (still qualify)</option>
              </select>
              {errors.taxDebtAmount && <p className="mt-1 text-sm text-red-600">{errors.taxDebtAmount}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="taxYearsOwed" className="block text-sm font-medium text-gray-700 mb-1">
              For Which Tax Years Do You Owe?
            </label>
            <select
              id="taxYearsOwed"
              name="taxYearsOwed"
              value={formData.taxYearsOwed || ""}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border ${errors.taxYearsOwed ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select tax years</option>
              <option value="current_year">Current year only</option>
              <option value="last_3_years">Last 1-3 years</option>
              <option value="last_5_years">Last 3-5 years</option>
              <option value="more_than_5_years">More than 5 years</option>
              <option value="not_sure">Not sure</option>
            </select>
            {errors.taxYearsOwed && <p className="mt-1 text-sm text-red-600">{errors.taxYearsOwed}</p>}
          </div>

          <div>
            <label htmlFor="unfiledReturns" className="block text-sm font-medium text-gray-700 mb-1">
              Do You Have Unfiled Tax Returns?
            </label>
            <select
              id="unfiledReturns"
              name="unfiledReturns"
              value={formData.unfiledReturns || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="not_sure">Not sure</option>
            </select>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 text-white flex items-center justify-center font-bold mr-3">
                J
              </div>
              <div>
                <p className="text-sm font-medium">James from Atlanta, GA</p>
                <p className="text-xs text-gray-500">1 month ago</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              "I owed $32,000 to the IRS and couldn't sleep at night. The tax relief program settled my debt for
              $13,500. I can finally breathe again."
            </p>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => setShowTaxFields(false)}
              className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Back
            </button>

            <button
              type="submit"
              className="w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              GET TAX RELIEF OPTIONS
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
            <span className="font-semibold">IRS Fresh Start Program:</span> Qualified taxpayers can settle their tax
            debt for significantly less than they owe.
          </p>
        </div>
      </div>
    </div>
  )
}
