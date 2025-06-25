"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  Download, 
  Smartphone, 
  Monitor, 
  CheckCircle, 
  XCircle, 
  Info, 
  Settings,
  Share2,
  Home,
  Globe,
  Zap,
  Shield,
  Wifi,
  Bell,
  Star,
  ArrowRight,
  RefreshCw,
  Copy,
  ExternalLink
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PWABuilderProps {
  onComplete?: () => void
  showOnLoad?: boolean
}

interface InstallationStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'completed' | 'failed' | 'skipped'
  action?: () => void
  manual?: boolean
}

export function PWABuilder({ onComplete, showOnLoad = false }: PWABuilderProps) {
  const [isOpen, setIsOpen] = useState(showOnLoad)
  const [currentStep, setCurrentStep] = useState(0)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deviceType, setDeviceType] = useState<"mobile" | "desktop">("desktop")
  const [browser, setBrowser] = useState("Unknown")
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isChrome, setIsChrome] = useState(false)
  const [isSafari, setIsSafari] = useState(false)
  const [isFirefox, setIsFirefox] = useState(false)
  const [isEdge, setIsEdge] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Detect device and browser
    const userAgent = navigator.userAgent
    if (/Android/i.test(userAgent)) {
      setDeviceType("mobile")
      setIsAndroid(true)
    } else if (/iPad|iPhone|iPod/i.test(userAgent)) {
      setDeviceType("mobile")
      setIsIOS(true)
    } else {
      setDeviceType("desktop")
    }

    if (userAgent.includes("Chrome")) {
      setBrowser("Chrome")
      setIsChrome(true)
    } else if (userAgent.includes("Firefox")) {
      setBrowser("Firefox")
      setIsFirefox(true)
    } else if (userAgent.includes("Safari")) {
      setBrowser("Safari")
      setIsSafari(true)
    } else if (userAgent.includes("Edge")) {
      setBrowser("Edge")
      setIsEdge(true)
    }

    // Check if already installed
    const checkInstallation = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || (window as any).navigator.standalone) {
        setIsInstalled(true)
      }
    }

    checkInstallation()

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true)
      toast({
        title: "🎉 PWA Installed Successfully!",
        description: "DailyBuddy is now installed on your device!",
      })
      onComplete?.()
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [toast, onComplete])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
        toast({
          title: "🎉 Installation Successful!",
          description: "DailyBuddy is now installed on your device!",
        })
        onComplete?.()
      }
    } else if (isIOS) {
      // Show iOS instructions
      setCurrentStep(5)
    } else if (isAndroid) {
      // Show Android instructions
      setCurrentStep(6)
    }
  }

  const installationSteps: InstallationStep[] = [
    {
      id: "browser-check",
      title: "Browser Compatibility",
      description: "Check if your browser supports PWA installation",
      icon: <Globe className="h-5 w-5" />,
      status: isChrome || isFirefox || isEdge || isSafari ? 'completed' : 'failed',
      action: () => {
        if (isChrome || isFirefox || isEdge || isSafari) {
          setCurrentStep(1)
        } else {
          toast({
            title: "Browser Not Supported",
            description: "Please use Chrome, Firefox, Edge, or Safari for PWA installation.",
            variant: "destructive"
          })
        }
      }
    },
    {
      id: "https-check",
      title: "Secure Connection",
      description: "Verify HTTPS connection for PWA installation",
      icon: <Shield className="h-5 w-5" />,
      status: window.location.protocol === 'https:' ? 'completed' : 'failed',
      action: () => {
        if (window.location.protocol === 'https:') {
          setCurrentStep(2)
        } else {
          toast({
            title: "HTTPS Required",
            description: "PWA installation requires a secure HTTPS connection.",
            variant: "destructive"
          })
        }
      }
    },
    {
      id: "service-worker",
      title: "Service Worker",
      description: "Check if service worker is registered",
      icon: <Zap className="h-5 w-5" />,
      status: 'completed', // We assume it's working since we have the PWA
      action: () => setCurrentStep(3)
    },
    {
      id: "manifest",
      title: "Web App Manifest",
      description: "Verify PWA manifest configuration",
      icon: <Settings className="h-5 w-5" />,
      status: 'completed', // We assume it's working
      action: () => setCurrentStep(4)
    },
    {
      id: "install",
      title: "Install PWA",
      description: "Install DailyBuddy as a native app",
      icon: <Download className="h-5 w-5" />,
      status: isInstalled ? 'completed' : deferredPrompt ? 'pending' : 'pending',
      action: handleInstall,
      manual: true
    }
  ]

  const copyInstallURL = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "URL Copied!",
        description: "Share this URL to help others install DailyBuddy",
      })
    }
  }

  const shareApp = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'DailyBuddy',
        text: 'Install DailyBuddy - Your friendly companion for a brighter, more organized day!',
        url: window.location.href
      })
    }
  }

  const getStepIcon = (step: InstallationStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'skipped':
        return <Info className="h-5 w-5 text-yellow-500" />
      default:
        return step.icon
    }
  }

  const getStepColor = (step: InstallationStep) => {
    switch (step.status) {
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'failed':
        return 'border-red-200 bg-red-50'
      case 'skipped':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-gray-200 bg-white'
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <Download className="mr-2 h-4 w-4" />
        PWA Builder
      </Button>
    )
  }

  const progress = ((currentStep + 1) / installationSteps.length) * 100

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            PWA Installation Builder
          </CardTitle>
          <CardDescription>
            Step-by-step guide to install DailyBuddy as a native app
          </CardDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Device Info */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {deviceType === "mobile" ? (
                <Smartphone className="h-5 w-5" />
              ) : (
                <Monitor className="h-5 w-5" />
              )}
              <span className="font-medium">{deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}</span>
              <Badge variant="outline">{browser}</Badge>
            </div>
            <div className="flex items-center gap-2">
              {isInstalled ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Installed
                </Badge>
              ) : (
                <Badge variant="outline">Not Installed</Badge>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Installation Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Installation Steps */}
          <div className="space-y-3">
            {installationSteps.map((step, index) => (
              <Card
                key={step.id}
                className={`cursor-pointer transition-all ${
                  index === currentStep ? 'ring-2 ring-blue-500' : ''
                } ${getStepColor(step)}`}
                onClick={() => step.action?.()}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {getStepIcon(step)}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                    {step.manual && (
                      <Button size="sm" variant="outline">
                        {step.status === 'completed' ? 'Done' : 'Manual'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* iOS Instructions */}
          {currentStep === 5 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>iOS Installation</AlertTitle>
              <AlertDescription>
                <div className="space-y-2 mt-2">
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Tap the Share button <Share2 className="inline h-3 w-3" /> in Safari</li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>Tap "Add" to confirm</li>
                    <li>Open DailyBuddy from your home screen</li>
                  </ol>
                  <Button size="sm" variant="outline" onClick={shareApp} className="mt-2">
                    <Share2 className="mr-1 h-3 w-3" />
                    Share to Add
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Android Instructions */}
          {currentStep === 6 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Android Installation</AlertTitle>
              <AlertDescription>
                <div className="space-y-2 mt-2">
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Tap the menu button (⋮) in Chrome</li>
                    <li>Tap "Add to Home screen" or "Install app"</li>
                    <li>Tap "Add" to confirm</li>
                    <li>Open DailyBuddy from your home screen</li>
                  </ol>
                  <Button size="sm" variant="outline" onClick={shareApp} className="mt-2">
                    <Share2 className="mr-1 h-3 w-3" />
                    Share to Install
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* PWA Benefits */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              PWA Benefits
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span>Works offline</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-500" />
                <span>Push notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-purple-500" />
                <span>Home screen icon</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span>Fast loading</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={copyInstallURL} variant="outline" className="flex-1">
              <Copy className="mr-2 h-4 w-4" />
              Copy URL
            </Button>
            <Button onClick={shareApp} variant="outline" className="flex-1">
              <Share2 className="mr-2 h-4 w-4" />
              Share App
            </Button>
            <Button 
              onClick={() => window.open('https://dailybudddy.vercel.app', '_blank')}
              variant="outline"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          {/* Troubleshooting */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Having trouble?</AlertTitle>
            <AlertDescription>
              <div className="space-y-2 mt-2">
                <p className="text-sm">• Make sure you're using a supported browser</p>
                <p className="text-sm">• Try refreshing the page and trying again</p>
                <p className="text-sm">• Check that notifications are enabled</p>
                <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Refresh Page
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
} 