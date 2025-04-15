import { v4 as uuidv4 } from "uuid"

// Session management for cross-device continuity
export class ContinuityService {
  private static instance: ContinuityService
  private sessionId: string

  private constructor() {
    // Generate or retrieve session ID
    this.sessionId = this.getOrCreateSessionId()
  }

  public static getInstance(): ContinuityService {
    if (!ContinuityService.instance) {
      ContinuityService.instance = new ContinuityService()
    }
    return ContinuityService.instance
  }

  // Get or create a session ID
  private getOrCreateSessionId(): string {
    if (typeof window === "undefined") return uuidv4()

    const storedId = localStorage.getItem("sessionId")
    if (storedId) {
      return storedId
    }

    const newId = uuidv4()
    localStorage.setItem("sessionId", newId)
    return newId
  }

  // Get current session ID
  public getSessionId(): string {
    return this.sessionId
  }

  // Save form data with session ID
  public saveFormData(formData: any): void {
    if (typeof window === "undefined") return

    localStorage.setItem(
      "formData",
      JSON.stringify({
        ...formData,
        sessionId: this.sessionId,
        lastUpdated: new Date().toISOString(),
      }),
    )

    // Also store in sessionStorage for tab continuity
    sessionStorage.setItem("formData", JSON.stringify(formData))
  }

  // Generate continuation link for email/SMS
  public generateContinuationLink(email: string, phone: string, currentStep: number): string {
    // In a real implementation, this would call an API to store the session
    // and generate a unique link. For this example, we'll create a simulated link.
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://example.com"
    const continuationToken = this.generateToken(currentStep)

    return `${baseUrl}?continue=${continuationToken}`
  }

  // Generate a token for continuation
  private generateToken(currentStep: number): string {
    if (typeof window === "undefined" || typeof btoa === "undefined") {
      return this.sessionId
    }

    return btoa(`${this.sessionId}|${currentStep}|${Date.now()}`)
  }

  // Generate QR code data for mobile-desktop switching
  public generateQRCodeData(currentStep: number): string {
    // In a real implementation, this would generate a proper QR code
    // For this example, we'll return the data that would be encoded
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://example.com"
    const continuationToken = this.generateToken(currentStep)

    return `${baseUrl}?continue=${continuationToken}`
  }

  // Check if there's a continuation token in the URL
  public processContinuationToken(): { hasToken: boolean; step?: number } {
    if (typeof window === "undefined") return { hasToken: false }

    const params = new URLSearchParams(window.location.search)
    const continueToken = params.get("continue")

    if (!continueToken) return { hasToken: false }

    try {
      const decoded = atob(continueToken)
      const [sessionId, step, timestamp] = decoded.split("|")

      // Validate the token (in a real implementation, you'd do more validation)
      if (sessionId && step && timestamp) {
        // Update the current session ID to match the one from the token
        localStorage.setItem("sessionId", sessionId)
        this.sessionId = sessionId

        return {
          hasToken: true,
          step: Number.parseInt(step, 10),
        }
      }
    } catch (e) {
      console.error("Invalid continuation token", e)
    }

    return { hasToken: false }
  }
}

// Export a singleton instance
export const continuityService = ContinuityService.getInstance()
