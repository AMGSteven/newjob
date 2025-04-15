// Compliance service for consent management and logging

type ConsentData = {
  type: string
  timestamp: string
  ipAddress: string
  userAgent: string
  formData: any
  tcpaText: string
  location?: {
    country?: string
    region?: string
    city?: string
  }
}

export class ComplianceService {
  private static instance: ComplianceService
  private consentLog: ConsentData[] = []
  private userIp = ""
  private userLocation: any = {}

  private constructor() {
    // Initialize IP detection
    this.detectUserIp()
  }

  public static getInstance(): ComplianceService {
    if (!ComplianceService.instance) {
      ComplianceService.instance = new ComplianceService()
    }
    return ComplianceService.instance
  }

  // Detect user IP (in a real implementation, this would call a server API)
  private async detectUserIp(): Promise<void> {
    try {
      // Simulate IP detection - in production this would be server-side
      this.userIp = "192.168.1.1" // Placeholder

      // Get approximate location based on IP
      await this.detectLocation()
    } catch (error) {
      console.error("Error detecting IP:", error)
    }
  }

  // Detect user location based on IP
  private async detectLocation(): Promise<void> {
    try {
      // In a real implementation, this would call a geolocation API
      // For this example, we'll use placeholder data
      this.userLocation = {
        country: "US",
        region: "CA",
        city: "Los Angeles",
      }
    } catch (error) {
      console.error("Error detecting location:", error)
    }
  }

  // Get dynamic TCPA language based on user location
  public getTcpaLanguage(): string {
    // Base TCPA language
    let tcpaText =
      "By submitting, I agree to receive telemarketing calls and text messages via automated technology from JobResourceCenter and its marketing partners at the phone number provided. I understand this consent is not a condition of purchase. Msg & data rates may apply. Reply STOP to cancel. View our Privacy Policy."

    // Add state-specific language if available
    if (this.userLocation?.region) {
      switch (this.userLocation.region) {
        case "CA":
          tcpaText += " CA residents: See our CA Privacy Notice for additional rights."
          break
        case "NV":
          tcpaText += " Under Nevada law, you may opt out of the sale of your personal information."
          break
        case "VA":
        case "CT":
        case "CO":
          tcpaText += " Residents of VA, CT, and CO have additional privacy rights under state law."
          break
        default:
          break
      }
    }

    return tcpaText
  }

  // Log consent with all required data
  public logConsent(type: string, formData: any, tcpaText: string): void {
    const consentData: ConsentData = {
      type,
      timestamp: new Date().toISOString(),
      ipAddress: this.userIp,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
      formData,
      tcpaText,
      location: this.userLocation,
    }

    // Add to local log
    this.consentLog.push(consentData)

    // In a real implementation, this would be sent to a server
    console.log("Consent logged:", consentData)

    // Store in localStorage for backup
    if (typeof window !== "undefined") {
      try {
        const existingLog = localStorage.getItem("consentLog")
        const parsedLog = existingLog ? JSON.parse(existingLog) : []
        parsedLog.push(consentData)
        localStorage.setItem("consentLog", JSON.stringify(parsedLog))
      } catch (e) {
        console.error("Error storing consent log:", e)
      }
    }
  }

  // Get user's IP address
  public getUserIp(): string {
    return this.userIp
  }

  // Get user's location
  public getUserLocation(): any {
    return this.userLocation
  }
}

// Export a singleton instance
export const complianceService = ComplianceService.getInstance()
