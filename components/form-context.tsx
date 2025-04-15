"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { continuityService } from "@/services/continuity-service"
import { complianceService } from "@/services/compliance-service"
import { preloadCriticalResources } from "@/utils/performance-utils"

type FormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  formattedPhone?: string
  zipCode: string
  address?: string
  city?: string
  state?: string
  employmentStatus?: string
  desiredIndustry?: string
  experienceLevel?: string
  educationLevel?: string
  timeline?: string
  salaryExpectations?: string
  resumeStatus?: string
  jobChallenges?: string[]
  hasAutoInsurance?: boolean
  insuranceProvider?: string
  vehicleCount?: number
  vehicleDetails?: string
  accidentsInLastThreeYears?: boolean
  creditScore?: string
  homeownerStatus?: string
  creditCardDebt?: number
  cardCount?: number
  interestRates?: string
  minimumPayments?: number
  missedPayments?: boolean
  formCompleted?: boolean
  tcpaConsent?: boolean
  sessionId?: string
  [key: string]: any
}

type FormContextType = {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  resetForm: () => void
  saveFieldProgress: (name: string, value: any) => void
  logConsent: (type: string, tcpaText: string) => void
  getTcpaLanguage: () => string
  generateContinuationLink: (currentStep: number) => string
  sessionId: string
  determineNextStep: (currentStep: number, formData: FormData) => number
}

const FormContext = createContext<FormContextType | undefined>(undefined)

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    zipCode: "",
  })
  const [sessionId, setSessionId] = useState<string>("")

  // Initialize services and load saved data
  useEffect(() => {
    // Set session ID
    const currentSessionId = continuityService.getSessionId()
    setSessionId(currentSessionId)

    // Check for continuation token in URL
    const { hasToken, step } = continuityService.processContinuationToken()

    // Load saved form data
    const savedData = localStorage.getItem("formData")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setFormData((prev) => ({ ...prev, ...parsedData }))
      } catch (e) {
        console.error("Error parsing saved form data", e)
      }
    }

    // Preload critical resources for performance
    preloadCriticalResources()
  }, [])

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => {
      const newData = { ...prev, ...data, sessionId }
      // Save to localStorage and update continuity service
      if (typeof window !== "undefined") {
        localStorage.setItem("formData", JSON.stringify(newData))
        continuityService.saveFormData(newData)
      }
      return newData
    })
  }

  // Save individual field progress as user types/selects
  const saveFieldProgress = (name: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value, sessionId }
      if (typeof window !== "undefined") {
        localStorage.setItem("formData", JSON.stringify(newData))
        continuityService.saveFormData(newData)
      }

      // If we have an email or phone, trigger abandonment tracking
      if ((name === "email" && value) || (name === "phone" && value)) {
        trackAbandonment(newData)
      }

      return newData
    })
  }

  // Track form abandonment for recovery
  const trackAbandonment = (data: FormData) => {
    // In a real implementation, this would send data to your backend
    // For this example, we'll just save to localStorage
    if (typeof window !== "undefined") {
      if (data.email) {
        localStorage.setItem("abandonEmail", data.email)
      }
      if (data.phone) {
        localStorage.setItem("abandonPhone", data.phone)
      }

      // Set up abandonment recovery
      window.addEventListener("beforeunload", () => {
        if (!data.formCompleted) {
          // This would trigger server-side abandonment recovery in a real implementation
          console.log("Form abandoned, recovery triggered")
        }
      })
    }
  }

  // Log consent with compliance service
  const logConsent = (type: string, tcpaText: string) => {
    complianceService.logConsent(type, formData, tcpaText)
  }

  // Get dynamic TCPA language based on location
  const getTcpaLanguage = () => {
    return complianceService.getTcpaLanguage()
  }

  // Generate continuation link for cross-device
  const generateContinuationLink = (currentStep: number) => {
    return continuityService.generateContinuationLink(formData.email || "", formData.phone || "", currentStep)
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      zipCode: "",
      sessionId,
    })
    if (typeof window !== "undefined") {
      localStorage.removeItem("formData")
    }
  }

  // Add a new function to determine the next step based on user responses
  const determineNextStep = (currentStep: number, formData: FormData): number => {
    // Default progression
    let nextStep = currentStep + 1

    // Implement branching logic based on user responses
    if (currentStep === 5) {
      // After credit card debt form
      // If user has high credit card debt, show debt relief, then personal loans
      if (formData.creditCardDebt && Number.parseInt(formData.creditCardDebt.toString()) >= 10000) {
        nextStep = 6 // Personal loans
      } else {
        nextStep = 6 // Still go to personal loans for everyone
      }
    } else if (currentStep === 7) {
      // After government benefits
      // If user is 65+, prioritize Medicare
      if (formData.age && (formData.age === "65-70" || formData.age === "71-75" || formData.age === "76+")) {
        nextStep = 8 // Healthcare options (will show Medicare)
      } else if (
        formData.annualIncome &&
        (formData.annualIncome === "0_15000" ||
          formData.annualIncome === "15000_30000" ||
          formData.annualIncome === "30000_45000")
      ) {
        nextStep = 8 // Healthcare options for lower income
      }
    }

    return nextStep
  }

  return (
    <FormContext.Provider
      value={{
        formData,
        updateFormData,
        resetForm,
        saveFieldProgress,
        logConsent,
        getTcpaLanguage,
        generateContinuationLink,
        sessionId,
        determineNextStep,
      }}
    >
      {children}
    </FormContext.Provider>
  )
}

export function useFormContext() {
  const context = useContext(FormContext)
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider")
  }
  return context
}
