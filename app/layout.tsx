import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
// Make sure the import is correct:
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MyCareerCove.com - Job Search Resource Center",
  description: "Get the ultimate job search toolkit and resources to land your dream job",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}


import './globals.css'