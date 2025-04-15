import { Shield, Lock, CheckCircle, Award } from "lucide-react"

interface SecurityBadgesProps {
  className?: string
}

export function SecurityBadges({ className = "" }: SecurityBadgesProps) {
  return (
    <div className={`flex flex-wrap justify-center gap-4 ${className}`}>
      <div className="flex flex-col items-center bg-white p-2 rounded-lg shadow-sm border border-gray-100">
        <Shield className="h-6 w-6 text-blue-600 mb-1" />
        <span className="text-xs font-medium text-gray-700">Norton Secured</span>
      </div>

      <div className="flex flex-col items-center bg-white p-2 rounded-lg shadow-sm border border-gray-100">
        <Lock className="h-6 w-6 text-blue-600 mb-1" />
        <span className="text-xs font-medium text-gray-700">McAfee Secure</span>
      </div>

      <div className="flex flex-col items-center bg-white p-2 rounded-lg shadow-sm border border-gray-100">
        <CheckCircle className="h-6 w-6 text-blue-600 mb-1" />
        <span className="text-xs font-medium text-gray-700">SSL Encrypted</span>
      </div>

      <div className="flex flex-col items-center bg-white p-2 rounded-lg shadow-sm border border-gray-100">
        <Award className="h-6 w-6 text-blue-600 mb-1" />
        <span className="text-xs font-medium text-gray-700">BBB A+ Rating</span>
      </div>
    </div>
  )
}
