import Image from "next/image"

interface LogoProps {
  width?: number
  height?: number
  className?: string
}

export function Logo({ width = 150, height = 50, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/images/logo.png"
        alt="MyCareerCove Logo"
        width={width}
        height={height}
        priority
        className="object-contain"
      />
    </div>
  )
}
