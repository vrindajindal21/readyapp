import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import { Toaster } from "@/components/ui/toaster"
import { GlobalNotificationService } from "@/components/global-notification-service"
import { SmartPopupSystem } from "@/components/smart-popup-system"
import { PomodoroBackgroundService } from "@/components/pomodoro-background-service"
import { PomodoroFloatingWidget } from "@/components/pomodoro-floating-widget"
import { ReminderManager } from "@/lib/reminder-manager"
import { InAppNotification } from "@/components/in-app-notification"
import PWARegister from "@/components/pwa-register"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DailyBuddy - Your Friendly Productivity Companion",
  description: "DailyBuddy helps you thrive with smart reminders, health tracking, and a friendly touch for all ages.",
  manifest: "/manifest.json",
  themeColor: "#6366f1",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  generator: 'v0.dev',
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DailyBuddy"
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://readyapp-zeta.vercel.app",
    title: "DailyBuddy - Your Friendly Productivity Companion",
    description: "DailyBuddy helps you thrive with smart reminders, health tracking, and a friendly touch for all ages.",
    siteName: "DailyBuddy"
  },
  twitter: {
    card: "summary_large_image",
    title: "DailyBuddy - Your Friendly Productivity Companion",
    description: "DailyBuddy helps you thrive with smart reminders, health tracking, and a friendly touch for all ages.",
    images: ["/android-chrome-512x512.png"]
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  }
}

// Ensure reminders are always checked globally
if (typeof window !== "undefined") {
  ReminderManager.initialize()
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="DailyBuddy" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DailyBuddy" />
        <meta name="description" content="DailyBuddy helps you thrive with smart reminders, health tracking, and a friendly touch for all ages." />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#6366f1" />
        
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#6366f1" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="msapplication-TileImage" content="/mstile-144x144.png" />
      </head>
      <body className={inter.className + " bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:via-indigo-900 dark:to-gray-800"}>
        <PWARegister />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <InAppNotification />
            {children}
            <Toaster />
            <GlobalNotificationService />
            <SmartPopupSystem />
            <PomodoroBackgroundService />
            <PomodoroFloatingWidget />
            <PWAInstallPrompt />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
