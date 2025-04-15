"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useFormContext } from "../form-context"
import { ProgressBar } from "../ui/progress-bar"
import { CheckCircle, DollarSign } from "lucide-react"
import { progressiveLoad } from "@/utils/performance-utils"
import { LazyImage } from "../ui/lazy-image"

interface PersonalLoansFormProps {
  onNext: () => void
  onBack: () => void
}

export function PersonalLoansForm({ onNext, onBack }: PersonalLoansFormProps) {
  const { formData, updateFormData, saveFieldProgress, logConsent } = useFormContext()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showLoanFields, setShowLoanFields] = useState(false)
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
  }, [showLoanFields])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (showLoanFields) {
      if (!formData.loanAmount) {
        newErrors.loanAmount = "Please select a loan amount"
      }

      if (!formData.loanPurpose) {
        newErrors.loanPurpose = "Please select a loan purpose"
      }

      if (!formData.creditScoreRange) {
        newErrors.creditScoreRange = "Please select your credit score range"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Log the loan request
      logConsent("personal_loan_request", "User requested personal loan information")
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

  const handleLoanResponse = (wantsLoan: boolean) => {
    setShowLoanFields(wantsLoan)
    updateFormData({ wantsPersonalLoan: wantsLoan })
    saveFieldProgress("wantsPersonalLoan", wantsLoan)

    if (!wantsLoan) {
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
        <ProgressBar currentStep={6} totalSteps={12} label="Profile 50% Complete" />

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-1">
            Consolidate Your Debt Into One Lower Monthly Payment
          </h2>
          <p className="text-sm text-blue-700">
            Simplify your finances with a personal loan that could save you money on interest.
          </p>
        </div>
      </div>

      {!showLoanFields ? (
        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-bold text-green-800 mb-1">Personal Loan Opportunity</h2>
            <p className="text-base text-green-700">
              Would you like to consolidate your debt into one simple monthly payment with potentially lower interest?
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleLoanResponse(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Yes, I want to save money
            </button>

            <button
              type="button"
              onClick={() => handleLoanResponse(false)}
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
                <span className="font-semibold">You may qualify for rates as low as 5.99% APR</span> based on your
                profile
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Loan Amount Needed
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="loanAmount"
                name="loanAmount"
                value={formData.loanAmount || ""}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border ${errors.loanAmount ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select loan amount</option>
                <option value="1000">$1,000 - $5,000</option>
                <option value="5000">$5,000 - $10,000</option>
                <option value="10000">$10,000 - $15,000</option>
                <option value="15000">$15,000 - $20,000</option>
                <option value="20000">$20,000 - $25,000</option>
                <option value="25000">$25,000 - $35,000</option>
                <option value="35000">$35,000 - $50,000</option>
                <option value="50000">$50,000+</option>
              </select>
              {errors.loanAmount && <p className="mt-1 text-sm text-red-600">{errors.loanAmount}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="loanPurpose" className="block text-sm font-medium text-gray-700 mb-1">
              Purpose of Loan
            </label>
            <select
              id="loanPurpose"
              name="loanPurpose"
              value={formData.loanPurpose || "debt_consolidation"}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border ${errors.loanPurpose ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="debt_consolidation">Debt Consolidation</option>
              <option value="home_improvement">Home Improvement</option>
              <option value="major_purchase">Major Purchase</option>
              <option value="medical_expenses">Medical Expenses</option>
              <option value="business">Business</option>
              <option value="other">Other</option>
            </select>
            {errors.loanPurpose && <p className="mt-1 text-sm text-red-600">{errors.loanPurpose}</p>}
          </div>

          <div>
            <label htmlFor="creditScoreRange" className="block text-sm font-medium text-gray-700 mb-1">
              Credit Score Range
            </label>
            <select
              id="creditScoreRange"
              name="creditScoreRange"
              value={formData.creditScoreRange || ""}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border ${errors.creditScoreRange ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select credit score range</option>
              <option value="excellent">Excellent (720+)</option>
              <option value="good">Good (680-719)</option>
              <option value="fair">Fair (620-679)</option>
              <option value="poor">Poor (580-619)</option>
              <option value="bad">Bad (below 580)</option>
              <option value="not_sure">Not Sure (Still Qualify)</option>
            </select>
            {errors.creditScoreRange && <p className="mt-1 text-sm text-red-600">{errors.creditScoreRange}</p>}
          </div>

          <div>
            <label htmlFor="employmentStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Employment Status
            </label>
            <select
              id="employmentStatus"
              name="employmentStatus"
              value={formData.employmentStatus || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select employment status</option>
              <option value="full_time">Full-Time</option>
              <option value="part_time">Part-Time</option>
              <option value="self_employed">Self-Employed</option>
              <option value="retired">Retired</option>
              <option value="unemployed">Unemployed</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Income
            </label>
            <select
              id="monthlyIncome"
              name="monthlyIncome"
              value={formData.monthlyIncome || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select monthly income</option>
              <option value="0_1000">$0 - $1,000</option>
              <option value="1000_2000">$1,000 - $2,000</option>
              <option value="2000_3000">$2,000 - $3,000</option>
              <option value="3000_4000">$3,000 - $4,000</option>
              <option value="4000_5000">$4,000 - $5,000</option>
              <option value="5000_7500">$5,000 - $7,500</option>
              <option value="7500_10000">$7,500 - $10,000</option>
              <option value="10000_plus">$10,000+</option>
            </select>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <LazyImage
                src="/placeholder.svg?height=40&width=40"
                alt="Testimonial Avatar"
                width={40}
                height={40}
                className="rounded-full mr-3"
              />
              <div>
                <p className="text-sm font-medium">James from Chicago, IL</p>
                <p className="text-xs text-gray-500">1 week ago</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              "I consolidated $22,000 of high-interest debt into one affordable monthly payment. My interest rate
              dropped from 24% to 9.5%!"
            </p>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => setShowLoanFields(false)}
              className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Back
            </button>

            <button
              type="submit"
              className="w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              SEE MY LOAN OPTIONS
            </button>
          </div>
        </form>
      )}

      {!showLoanFields && (
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
        className={`mt-6 p-4 bg-blue-50 rounded-lg transition-opacity duration-300 ${loadedSections.footer ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex items-center">
          <DollarSign className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Limited Time Offer:</span> Pre-qualified applicants can receive funds as
            soon as tomorrow!
          </p>
        </div>
      </div>
    </div>
  )
}
