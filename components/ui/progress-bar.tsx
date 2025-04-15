interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  label?: string
}

export function ProgressBar({ currentStep, totalSteps, label }: ProgressBarProps) {
  const percentage = Math.min(Math.round((currentStep / totalSteps) * 100), 100)

  // Artificially weight progress to show slower progress advancement
  // This keeps users engaged by showing smaller increments
  const displayPercentage = Math.min(Math.round(percentage * 0.85), 100)

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label || `${displayPercentage}% Complete`}</span>
        <span className="text-sm font-medium text-blue-600">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${displayPercentage}%` }}
        ></div>
      </div>
    </div>
  )
}
