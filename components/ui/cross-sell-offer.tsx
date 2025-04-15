"use client"

import { CreditCard, Home, Car, FileText } from "lucide-react"

interface CrossSellOfferProps {
  title: string
  description: string
  icon: "credit-card" | "home" | "car" | "file"
  onClick: () => void
  className?: string
}

export function CrossSellOffer({ title, description, icon, onClick, className = "" }: CrossSellOfferProps) {
  const getIcon = () => {
    switch (icon) {
      case "credit-card":
        return <CreditCard className="h-10 w-10 text-blue-600" />
      case "home":
        return <Home className="h-10 w-10 text-green-600" />
      case "car":
        return <Car className="h-10 w-10 text-purple-600" />
      case "file":
        return <FileText className="h-10 w-10 text-orange-600" />
      default:
        return <FileText className="h-10 w-10 text-blue-600" />
    }
  }

  return (
    <div
      className={`border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="mr-4 flex-shrink-0">{getIcon()}</div>
        <div>
          <h4 className="font-medium text-blue-600">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  )
}
