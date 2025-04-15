"use client"

import { useState, useEffect } from "react"

interface RecentActivityProps {
  interval?: number
}

const activities = [
  { name: "John", location: "Phoenix, AZ", action: "qualified for debt relief", time: "2 minutes ago" },
  { name: "Sarah", location: "Chicago, IL", action: "found a new job opportunity", time: "5 minutes ago" },
  { name: "Michael", location: "Dallas, TX", action: "saved $350 on insurance", time: "8 minutes ago" },
  { name: "Emily", location: "Miami, FL", action: "qualified for healthcare benefits", time: "12 minutes ago" },
  { name: "David", location: "Seattle, WA", action: "received tax relief", time: "15 minutes ago" },
]

export function RecentActivity({ interval = 8000 }: RecentActivityProps) {
  const [showNotification, setShowNotification] = useState(false)
  const [currentActivity, setCurrentActivity] = useState(activities[0])
  const [activityIndex, setActivityIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activityIndex + 1) % activities.length
      setCurrentActivity(activities[nextIndex])
      setActivityIndex(nextIndex)
      setShowNotification(true)

      // Hide after 5 seconds
      setTimeout(() => {
        setShowNotification(false)
      }, 5000)
    }, interval)

    return () => clearInterval(timer)
  }, [activityIndex, interval])

  if (!showNotification) return null

  return (
    <div className="recent-activity slide-in">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold mr-3 flex-shrink-0">
          {currentActivity.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium">
            {currentActivity.name} from {currentActivity.location} just {currentActivity.action}
          </p>
          <p className="text-xs text-gray-500">{currentActivity.time}</p>
        </div>
      </div>
    </div>
  )
}
