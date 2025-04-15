"use client"

import { useState, useEffect } from "react"
import { InitialForm } from "./form-steps/initial-form"
import { VerificationForm } from "./form-steps/verification-form"
import { JobQualifierForm } from "./form-steps/job-qualifier-form"
import { AutoInsuranceForm } from "./form-steps/auto-insurance-form"
import { CreditCardDebtForm } from "./form-steps/credit-card-debt-form"
import { PersonalLoansForm } from "./form-steps/personal-loans-form"
import { GovernmentBenefitsForm } from "./form-steps/government-benefits-form"
import { HealthcareOptionsForm } from "./form-steps/healthcare-options-form"
import { DisabilityAssistanceForm } from "./form-steps/disability-assistance-form"
import { TaxReliefForm } from "./form-steps/tax-relief-form"
import { CellPhoneSavingsForm } from "./form-steps/cell-phone-savings-form"
import { FinalStep } from "./form-steps/final-step"
import { FormProvider, useFormContext } from "./form-context"
import { ExitIntentPopup } from "./ui/exit-intent-popup"
import { continuityService } from "@/services/continuity-service"
import { monitorWebVitals } from "@/utils/performance-utils"

// Create a wrapper component to access the form context
function FormSteps() {
  const [currentStep, setCurrentStep] = useState(1)
  const { formData, determineNextStep } = useFormContext()

  // Check for continuation token and abandoned form on load
  useEffect(() => {
    // Check for continuation token in URL
    const { hasToken, step } = continuityService.processContinuationToken()

    if (hasToken && step && step > 0 && step <= 12) {
      setCurrentStep(step)
    } else {
      // Check for abandoned form data
      const savedData = localStorage.getItem("formData")
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          // If they completed step 1, start them at step 2
          if (
            parsedData.firstName &&
            parsedData.lastName &&
            parsedData.email &&
            parsedData.phone &&
            parsedData.zipCode
          ) {
            setCurrentStep(2)
          }
        } catch (e) {
          console.error("Error parsing saved form data", e)
        }
      }
    }
  }, [])

  const handleNext = () => {
    const nextStep = determineNextStep(currentStep, formData)
    setCurrentStep(nextStep)
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  // Map step number to component
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <InitialForm onNext={handleNext} />
      case 2:
        return <VerificationForm onNext={handleNext} onBack={handleBack} />
      case 3:
        return <JobQualifierForm onNext={handleNext} onBack={handleBack} />
      case 4:
        return <AutoInsuranceForm onNext={handleNext} onBack={handleBack} />
      case 5:
        return <CreditCardDebtForm onNext={handleNext} onBack={handleBack} />
      case 6:
        return <PersonalLoansForm onNext={handleNext} onBack={handleBack} />
      case 7:
        return <GovernmentBenefitsForm onNext={handleNext} onBack={handleBack} />
      case 8:
        return <HealthcareOptionsForm onNext={handleNext} onBack={handleBack} />
      case 9:
        return <DisabilityAssistanceForm onNext={handleNext} onBack={handleBack} />
      case 10:
        return <TaxReliefForm onNext={handleNext} onBack={handleBack} />
      case 11:
        return <CellPhoneSavingsForm onNext={handleNext} onBack={handleBack} />
      case 12:
        return <FinalStep onRestart={() => setCurrentStep(1)} />
      default:
        return <InitialForm onNext={handleNext} />
    }
  }

  return renderStep()
}

// Update the main JobSearchForm component
export function JobSearchForm() {
  const [isLoading, setIsLoading] = useState(true)

  // Check for continuation token and abandoned form on load
  useEffect(() => {
    // Monitor web vitals for performance
    monitorWebVitals()

    // Simulate initial loading for progressive rendering
    setTimeout(() => {
      setIsLoading(false)
    }, 100)
  }, [])

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <FormProvider>
      <div className="w-full max-w-4xl mx-auto px-4 py-8 relative">
        <FormSteps />
      </div>
      <ExitIntentPopup />
    </FormProvider>
  )
}
