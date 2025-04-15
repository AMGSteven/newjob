import { Shield, Check, Award } from "lucide-react"

export function TrustIndicators() {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-6 mb-4">
      <div className="flex items-center gap-2 text-gray-600">
        <Shield className="h-5 w-5 text-green-600" />
        <span className="text-sm">Secure Form</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <Check className="h-5 w-5 text-green-600" />
        <span className="text-sm">256-bit Encryption</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <Award className="h-5 w-5 text-green-600" />
        <span className="text-sm">BBB A+ Rated</span>
      </div>
    </div>
  )
}
