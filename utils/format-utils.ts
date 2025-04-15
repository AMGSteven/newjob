// Format a phone number as (XXX) XXX-XXXX
export function formatPhoneNumber(value: string): string {
  if (!value) return value

  // Remove all non-digit characters
  const phoneNumber = value.replace(/[^\d]/g, "")

  // Format based on length
  if (phoneNumber.length < 4) {
    return phoneNumber
  } else if (phoneNumber.length < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
  } else {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }
}

// Get raw phone number (digits only)
export function getRawPhoneNumber(value: string): string {
  return value.replace(/[^\d]/g, "")
}

// Validate phone number (must be 10 digits)
export function isValidPhoneNumber(value: string): boolean {
  const rawNumber = getRawPhoneNumber(value)
  return rawNumber.length === 10
}
