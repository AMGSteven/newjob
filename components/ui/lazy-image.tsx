"use client"

import { useState, useEffect, useRef } from "react"
import { hasIntersectionObserver } from "@/utils/performance-utils"

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

export function LazyImage({ src, alt, width, height, className = "" }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!hasIntersectionObserver || !imgRef.current) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: "200px", // Load when within 200px of viewport
        threshold: 0.01,
      },
    )

    observer.observe(imgRef.current)

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current)
      }
    }
  }, [])

  const handleError = () => {
    setError(true)
    setIsLoaded(true)
  }

  // If there's an error or no src, render a colored div instead
  if (error || !src) {
    return (
      <div
        className={`bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-500 font-medium rounded ${className}`}
        style={{
          width: width ? `${width}px` : "100%",
          height: height ? `${height}px` : "100px",
        }}
      >
        {alt.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "auto",
      }}
    >
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded"
          style={{ width: width ? `${width}px` : "100%", height: height ? `${height}px` : "100%" }}
        />
      )}

      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        data-src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300 ${className}`}
      />
    </div>
  )
}
