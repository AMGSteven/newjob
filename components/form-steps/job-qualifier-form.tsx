"use client"

import type React from "react"

import { useState } from "react"
import { useFormContext } from "../form-context"
import { ProgressBar } from "../ui/progress-bar"

interface JobQualifierFormProps {
  onNext: () => void
  onBack: () => void
}

export function JobQualifierForm({ onNext, onBack }: JobQualifierFormProps) {
  const { formData, updateFormData } = useFormContext()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.employmentStatus) {
      newErrors.employmentStatus = "Please select your current employment status"
    }

    if (!formData.desiredIndustry) {
      newErrors.desiredIndustry = "Please select your desired industry"
    }

    if (!formData.experienceLevel) {
      newErrors.experienceLevel = "Please select your experience level"
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

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    updateFormData({ [name]: value })

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
    const { name, value, checked } = e.target

    // Handle multiple selections for job challenges
    if (name === "jobChallenges") {
      const currentChallenges = formData.jobChallenges || []
      let newChallenges

      if (checked) {
        newChallenges = [...currentChallenges, value]
      } else {
        newChallenges = currentChallenges.filter((challenge) => challenge !== value)
      }

      updateFormData({ jobChallenges: newChallenges })
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <ProgressBar currentStep={3} totalSteps={6} label="Profile 50% Complete" />

      <h2 className="text-2xl font-bold text-center mb-2">Tell Us About Your Job Search</h2>

      <p className="text-center text-gray-600 mb-6">Help us customize your career resources</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="employmentStatus" className="block text-sm font-medium text-gray-700 mb-1">
            Current Employment Status
          </label>
          <select
            id="employmentStatus"
            name="employmentStatus"
            value={formData.employmentStatus || ""}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border ${errors.employmentStatus ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Select your status</option>
            <option value="employed">Employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="student">Student</option>
            <option value="retired">Retired</option>
          </select>
          {errors.employmentStatus && <p className="mt-1 text-sm text-red-600">{errors.employmentStatus}</p>}
        </div>

        <div>
          <label htmlFor="desiredIndustry" className="block text-sm font-medium text-gray-700 mb-1">
            Desired Industry/Position
          </label>
          <select
            id="desiredIndustry"
            name="desiredIndustry"
            value={formData.desiredIndustry || ""}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border ${errors.desiredIndustry ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Select an industry</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="education">Education</option>
            <option value="retail">Retail</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="hospitality">Hospitality</option>
            <option value="marketing">Marketing</option>
            <option value="sales">Sales</option>
            <option value="construction">Construction</option>
            <option value="legal">Legal</option>
            <option value="government">Government</option>
            <option value="nonprofit">Nonprofit</option>
            <option value="other">Other</option>
          </select>
          {errors.desiredIndustry && <p className="mt-1 text-sm text-red-600">{errors.desiredIndustry}</p>}
        </div>

        <div>
          <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">
            Experience Level
          </label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            value={formData.experienceLevel || ""}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border ${errors.experienceLevel ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Select your experience</option>
            <option value="entry">Entry Level (0-2 years)</option>
            <option value="mid">Mid Level (3-5 years)</option>
            <option value="senior">Senior Level (6-10 years)</option>
            <option value="executive">Executive (10+ years)</option>
          </select>
          {errors.experienceLevel && <p className="mt-1 text-sm text-red-600">{errors.experienceLevel}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What challenges are you facing in your job search? (Select all that apply)
          </label>
          <div className="space-y-2">
            <div className="flex items-start">
              <input
                id="challenge-resume"
                name="jobChallenges"
                type="checkbox"
                value="resume"
                checked={(formData.jobChallenges || []).includes("resume")}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <label htmlFor="challenge-resume" className="ml-3 text-sm text-gray-700">
                Creating an effective resume
              </label>
            </div>

            <div className="flex items-start">
              <input
                id="challenge-interviews"
                name="jobChallenges"
                type="checkbox"
                value="interviews"
                checked={(formData.jobChallenges || []).includes("interviews")}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <label htmlFor="challenge-interviews" className="ml-3 text-sm text-gray-700">
                Preparing for interviews
              </label>
            </div>

            <div className="flex items-start">
              <input
                id="challenge-opportunities"
                name="jobChallenges"
                type="checkbox"
                value="opportunities"
                checked={(formData.jobChallenges || []).includes("opportunities")}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <label htmlFor="challenge-opportunities" className="ml-3 text-sm text-gray-700">
                Finding job opportunities
              </label>
            </div>

            <div className="flex items-start">
              <input
                id="challenge-networking"
                name="jobChallenges"
                type="checkbox"
                value="networking"
                checked={(formData.jobChallenges || []).includes("networking")}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <label htmlFor="challenge-networking" className="ml-3 text-sm text-gray-700">
                Networking effectively
              </label>
            </div>

            <div className="flex items-start">
              <input
                id="challenge-salary"
                name="jobChallenges"
                type="checkbox"
                value="salary"
                checked={(formData.jobChallenges || []).includes("salary")}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <label htmlFor="challenge-salary" className="ml-3 text-sm text-gray-700">
                Negotiating salary
              </label>
            </div>
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
            className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            CONTINUE
          </button>
        </div>
      </form>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          <span className="font-semibold">Hot streak!</span> You're on a roll! Just 3 more steps to unlock your
          personalized career resources.
        </p>
      </div>
    </div>
  )
}
