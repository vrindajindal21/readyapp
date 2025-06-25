"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Download, 
  Smartphone, 
  Monitor, 
  X, 
  CheckCircle,
  Home,
  Share2
} from "lucide-react"

interface PWAInstallPromptProps {
  onClose?: () => void
}

export function PWAInstallPrompt({ onClose }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [deviceType, setDeviceType] = useState<"mobile" | "desktop">("desktop")

  useEffect(() => {
    // Check if already installed
    const checkInstallation = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || (window as any).navigator.standalone) {
        setIsInstalled(true)
        setShowPrompt(false)
      }
    }

    checkInstallation()

    // Detect device type
    const userAgent = navigator.userAgent
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      setDeviceType("mobile")
    } else {
      setDeviceType("desktop")
    }

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Show prompt after a delay if not installed
    const timer = setTimeout(() => {
      if (!isInstalled && !deferredPrompt) {
        setShowPrompt(true)
      }
    }, 5000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      clearTimeout(timer)
    }
  }, [deferredPrompt, isInstalled])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setShowPrompt(false)
      }
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'DailyBuddy',
        text: 'Install DailyBuddy for the best experience!',
        url: window.location.href
      })
    }
  }

  if (!showPrompt || isInstalled) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-blue-200 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="h-5 w-5 text-blue-600" />
              Install DailyBuddy
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowPrompt(false)
                onClose?.()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Get the best experience with our app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            {deviceType === "mobile" ? (
              <Smartphone className="h-4 w-4 text-green-600" />
            ) : (
              <Monitor className="h-4 w-4 text-blue-600" />
            )}
            <Badge variant="outline">
              {deviceType === "mobile" ? "Mobile" : "Desktop"} App
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Works offline</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Push notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>App-like experience</span>
            </div>
          </div>

          <div className="flex gap-2">
            {deferredPrompt ? (
              <Button 
                onClick={handleInstall}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Install Now
              </Button>
            ) : (
              <Button 
                onClick={handleShare}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share to Install
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => setShowPrompt(false)}
            >
              Later
            </Button>
          </div>

          {deviceType === "mobile" && !deferredPrompt && (
            <Alert>
              <AlertDescription className="text-xs">
                <strong>Mobile users:</strong> Tap the share button in your browser and select "Add to Home Screen"
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 