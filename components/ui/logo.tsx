interface LogoProps {
  width?: number
  height?: number
  className?: string
}

export function Logo({ width = 120, height = 50, className = "" }: LogoProps) {
  return (
    <div
      className={`flex items-center justify-center font-bold text-blue-600 ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <span className="text-xl">MyCareerCove</span>
    </div>
  )
}
