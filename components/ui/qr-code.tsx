"use client"

import { useEffect, useRef } from "react"
import { continuityService } from "@/services/continuity-service"

interface QRCodeProps {
  currentStep: number
  size?: number
}

export function QRCode({ currentStep, size = 128 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const qrData = continuityService.generateQRCodeData(currentStep)
    const ctx = canvasRef.current.getContext("2d")

    if (!ctx) return

    // Draw a simplified QR code placeholder
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, size, size)
    ctx.fillStyle = "#2851A3"

    // Draw a grid pattern to resemble a QR code
    const gridSize = 5
    const cellSize = size / gridSize

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (Math.random() > 0.5) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize)
        }
      }
    }

    // Always draw the position detection patterns
    ctx.fillRect(0, 0, cellSize * 2, cellSize * 2)
    ctx.fillRect(0, cellSize * (gridSize - 2), cellSize * 2, cellSize * 2)
    ctx.fillRect(cellSize * (gridSize - 2), 0, cellSize * 2, cellSize * 2)

    // Add text
    ctx.fillStyle = "#000000"
    ctx.font = "10px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Scan to continue", size / 2, size / 2)
  }, [currentStep, size])

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={size} height={size} className="border border-gray-200 rounded"></canvas>
      <p className="text-xs text-gray-500 mt-2">Scan to continue on mobile</p>
    </div>
  )
}
