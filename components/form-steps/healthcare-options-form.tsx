"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useFormContext } from "../form-context"
import { ProgressBar } from "../ui/progress-bar"
import { CheckCircle, Heart } from "lucide-react"
import { progressiveLoad } from "@/utils/performance-utils"

interface HealthcareOptionsFormProps {
  onNext: () => void
  onBack: () => void
}

export function HealthcareOptionsForm({ onNext, onBack }: HealthcareOptionsFormProps) {
  const { formData, updateFormData, saveFieldProgress, logConsent } = useFormContext()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loadedSections, setLoadedSections] = useState({
    header: false,
    form: false,
    footer: false,
  })
  const formRef = useRef<HTMLFormElement>(null)
  const [isOver65, setIsOver65] = useState(false)

  // Progressive loading of form sections
  useEffect(() => {
    if (formRef.current) {
      progressiveLoad(formRef.current, () => {
        setLoadedSections((prev) => ({ ...prev, form: true }))
      })
    }

    // Check age based on previous form data
    if (formData.age) {
      setIsOver65(Number.parseInt(formData.age) >= 65)
    }
  }, [formData.age])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.age) {
      newErrors.age = "Please select your age"
    }

    if (!isOver65) {
      // ACA-specific validations
      if (!formData.healthcareZipCode) {
        newErrors.healthcareZipCode = "Please enter your ZIP code"
      }

      if (!formData.householdSize && !formData.healthcareHouseholdSize) {
        newErrors.healthcareHouseholdSize = "Please select your household size"
      }
    } else {
      // Medicare-specific validations
      if (!formData.medicareStatus) {
        newErrors.medicareStatus = "Please select your Medicare status"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Log the healthcare request
      logConsent(
        isOver65 ? "medicare_request" : "aca_health_insurance_request",
        `User requested ${isOver65 ? "Medicare" : "ACA health insurance"} information`,
      )
      onNext()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    updateFormData({ [name]: value })
    saveFieldProgress(name, value)

    // If age is changed, update the isOver65 state
    if (name === "age") {
      setIsOver65(Number.parseInt(value) >= 65)
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
        <ProgressBar currentStep={8} totalSteps={12} label="Profile 67% Complete" />

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-1">
            {isOver65
              ? "Get Dental, Vision & Prescription Coverage With $0 Premium Plans"
              : "Save Up To 80% On Health Insurance With Subsidies"}
          </h2>
          <p className="text-sm text-blue-700">
            {isOver65
              ? "Discover newly available Medicare benefits you may not know about."
              : "Special enrollment period available now - don't miss out!"}
          </p>
        </div>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={`space-y-4 transition-opacity duration-300 ${loadedSections.form ? "opacity-100" : "opacity-0"}`}
      >
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
            Your Age
          </label>
          <select
            id="age"
            name="age"
            value={formData.age || ""}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border ${errors.age ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Select your age</option>
            <option value="18-25">18-25</option>
            <option value="26-35">26-35</option>
            <option value="36-45">36-45</option>
            <option value="46-55">46-55</option>
            <option value="56-64">56-64</option>
            <option value="65-70">65-70</option>
            <option value="71-75">71-75</option>
            <option value="76+">76+</option>
          </select>
          {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
        </div>

        {!isOver65 ? (
          // ACA Health Insurance Form
          <>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 mr-2 flex-shrink-0" />
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Special Enrollment Period Now Open!</span> You may qualify for
                  subsidies that reduce your premium to as low as $0/month.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="healthcareZipCode" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                id="healthcareZipCode"
                name="healthcareZipCode"
                value={formData.healthcareZipCode || formData.zipCode || ""}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${errors.healthcareZipCode ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter your ZIP code"
              />
              {errors.healthcareZipCode && <p className="mt-1 text-sm text-red-600">{errors.healthcareZipCode}</p>}
            </div>

            <div>
              <label htmlFor="healthcareHouseholdSize" className="block text-sm font-medium text-gray-700 mb-1">
                Household Size
              </label>
              <select
                id="healthcareHouseholdSize"
                name="healthcareHouseholdSize"
                value={formData.healthcareHouseholdSize || formData.householdSize || ""}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${errors.healthcareHouseholdSize ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select household size</option>
                <option value="1">1 person</option>
                <option value="2">2 people</option>
                <option value="3">3 people</option>
                <option value="4">4 people</option>
                <option value="5">5 people</option>
                <option value="6">6+ people</option>
              </select>
              {errors.healthcareHouseholdSize && (
                <p className="mt-1 text-sm text-red-600">{errors.healthcareHouseholdSize}</p>
              )}
            </div>

            <div>
              <label htmlFor="healthcareIncome" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Annual Household Income
              </label>
              <select
                id="healthcareIncome"
                name="healthcareIncome"
                value={formData.healthcareIncome || formData.annualIncome || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select income range</option>
                <option value="0_15000">$0 - $15,000</option>
                <option value="15000_30000">$15,000 - $30,000</option>
                <option value="30000_45000">$30,000 - $45,000</option>
                <option value="45000_60000">$45,000 - $60,000</option>
                <option value="60000_75000">$60,000 - $75,000</option>
                <option value="75000_100000">$75,000 - $100,000</option>
                <option value="100000_plus">$100,000+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do any of these apply to you? (Select all that apply)
              </label>
              <div className="space-y-2">
                <div className="flex items-start">
                  <input
                    id="lost-coverage"
                    name="lostCoverage"
                    type="checkbox"
                    checked={formData.lostCoverage || false}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor="lost-coverage" className="ml-3 text-sm text-gray-700">
                    Lost health insurance in the past 60 days
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    id="moved"
                    name="recentlyMoved"
                    type="checkbox"
                    checked={formData.recentlyMoved || false}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor="moved" className="ml-3 text-sm text-gray-700">
                    Recently moved to a new ZIP code
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    id="income-change"
                    name="incomeChanged"
                    type="checkbox"
                    checked={formData.incomeChanged || false}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor="income-change" className="ml-3 text-sm text-gray-700">
                    Income changed significantly
                  </label>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Medicare Form for users 65+
          <>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 mr-2 flex-shrink-0" />
                <p className="text-sm text-green-800">
                  <span className="font-semibold">New Medicare Benefits Available!</span> You may qualify for $0 premium
                  plans with dental, vision, and prescription coverage.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="medicareStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Medicare Status
              </label>
              <select
                id="medicareStatus"
                name="medicareStatus"
                value={formData.medicareStatus || ""}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${errors.medicareStatus ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select your Medicare status</option>
                <option value="enrolled_part_a_b">Enrolled in Medicare Part A & B</option>
                <option value="enrolled_part_a">Enrolled in Medicare Part A only</option>
                <option value="enrolled_advantage">Enrolled in Medicare Advantage</option>
                <option value="not_enrolled">Not yet enrolled in Medicare</option>
                <option value="not_sure">Not sure</option>
              </select>
              {errors.medicareStatus && <p className="mt-1 text-sm text-red-600">{errors.medicareStatus}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What additional coverage are you interested in? (Select all that apply)
              </label>
              <div className="space-y-2">
                <div className="flex items-start">
                  <input
                    id="dental"
                    name="needsDental"
                    type="checkbox"
                    checked={formData.needsDental || false}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor="dental" className="ml-3 text-sm text-gray-700">
                    Dental coverage
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    id="vision"
                    name="needsVision"
                    type="checkbox"
                    checked={formData.needsVision || false}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor="vision" className="ml-3 text-sm text-gray-700">
                    Vision coverage
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    id="prescription"
                    name="needsPrescription"
                    type="checkbox"
                    checked={formData.needsPrescription || false}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor="prescription" className="ml-3 text-sm text-gray-700">
                    Prescription drug coverage
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    id="hearing"
                    name="needsHearing"
                    type="checkbox"
                    checked={formData.needsHearing || false}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor="hearing" className="ml-3 text-sm text-gray-700">
                    Hearing benefits
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

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
            {isOver65 ? "SEE MEDICARE OPTIONS" : "CHECK AVAILABLE PLANS"}
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
        <div className="flex items-center">
          <Heart className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Limited Time Offer:</span>{" "}
            {isOver65 ? "Medicare enrollment period closing soon!" : "Special enrollment period available now!"}
          </p>
        </div>
      </div>
    </div>
  )
}
