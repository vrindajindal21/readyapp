"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Bell, 
  BellOff, 
  Smartphone, 
  Monitor, 
  Tablet, 
  CheckCircle, 
  XCircle, 
  Info,
  Settings,
  Home,
  Share2,
  HelpCircle
} from "lucide-react"
import { requestFcmToken, onForegroundMessage } from "@/lib/firebase-messaging"
import { NotificationHelpModal } from "@/components/notification-help-modal"

interface NotificationSetupGuideProps {
  onComplete?: () => void
  showOnLoad?: boolean
}

export function NotificationSetupGuide({ onComplete, showOnLoad = false }: NotificationSetupGuideProps) {
  const [isOpen, setIsOpen] = useState(showOnLoad)
  const [showHelp, setShowHelp] = useState(false)
  const [permissionState, setPermissionState] = useState<NotificationPermission>("default")
  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const [deviceType, setDeviceType] = useState<"mobile" | "desktop" | "tablet">("desktop")
  const [browser, setBrowser] = useState<string>("")
  const [isIOS, setIsIOS] = useState(false)
  const [isPWAInstalled, setIsPWAInstalled] = useState(false)
  const [testMessage, setTestMessage] = useState("")

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      setDeviceType(/iPad|Tablet/i.test(userAgent) ? "tablet" : "mobile")
    } else {
      setDeviceType("desktop")
    }

    // Detect browser
    if (userAgent.includes("Chrome")) setBrowser("Chrome")
    else if (userAgent.includes("Firefox")) setBrowser("Firefox")
    else if (userAgent.includes("Safari")) setBrowser("Safari")
    else if (userAgent.includes("Edge")) setBrowser("Edge")
    else setBrowser("Unknown")

    // Check if iOS
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream)

    // Check if PWA is installed
    setIsPWAInstalled(window.matchMedia('(display-mode: standalone)').matches || (window as any).navigator.standalone)

    // Check current permission
    if ('Notification' in window) {
      setPermissionState(Notification.permission)
    }

    // Listen for permission changes
    const handlePermissionChange = () => {
      setPermissionState(Notification.permission)
    }

    window.addEventListener('focus', handlePermissionChange)
    return () => window.removeEventListener('focus', handlePermissionChange)
  }, [])

  // Listen for foreground FCM messages
  useEffect(() => {
    if (typeof window !== 'undefined') {
      onForegroundMessage((payload) => {
        setTestMessage(`✅ Received: ${payload.notification?.title || 'Notification'}: ${payload.notification?.body || ''}`)
        setTimeout(() => setTestMessage(""), 5000)
      })
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      setTestMessage("❌ Notifications are not supported in this browser")
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      setPermissionState(permission)
      
      if (permission === 'granted') {
        // Request FCM token
        const token = await requestFcmToken()
        if (token) {
          setFcmToken(token)
          setTestMessage("✅ Notifications enabled! FCM token received.")
          onComplete?.()
          return true
        } else {
          setTestMessage("⚠️ Notifications enabled, but FCM token failed. Notifications may not work when app is closed.")
          return false
        }
      } else {
        setTestMessage("❌ Permission denied. Please enable notifications in browser settings.")
        return false
      }
    } catch (error) {
      setTestMessage("❌ Error requesting permission")
      return false
    }
  }

  const testNotification = async () => {
    if (permissionState !== 'granted') {
      setTestMessage("❌ Please enable notifications first")
      return
    }

    try {
      const notification = new Notification("DailyBuddy Test", {
        body: "This is a test notification from DailyBuddy! 🎉",
        icon: "/android-chrome-192x192.png",
        badge: "/android-chrome-192x192.png",
        tag: "test",
        requireInteraction: true
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      setTestMessage("✅ Test notification sent! Check your notifications.")
    } catch (error) {
      setTestMessage("❌ Failed to send test notification")
    }
  }

  const getDeviceIcon = () => {
    switch (deviceType) {
      case "mobile": return <Smartphone className="h-5 w-5" />
      case "tablet": return <Tablet className="h-5 w-5" />
      default: return <Monitor className="h-5 w-5" />
    }
  }

  const getPermissionStatus = () => {
    switch (permissionState) {
      case "granted":
        return { icon: <CheckCircle className="h-4 w-4 text-green-500" />, text: "Enabled", color: "bg-green-100 text-green-800" }
      case "denied":
        return { icon: <XCircle className="h-4 w-4 text-red-500" />, text: "Disabled", color: "bg-red-100 text-red-800" }
      default:
        return { icon: <Info className="h-4 w-4 text-yellow-500" />, text: "Not Set", color: "bg-yellow-100 text-yellow-800" }
    }
  }

  const permissionStatus = getPermissionStatus()

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <Bell className="mr-2 h-4 w-4" />
        Setup Notifications
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Setup Guide
          </CardTitle>
          <CardDescription>
            Enable push notifications to receive reminders even when the app is closed
          </CardDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(true)}
            className="absolute top-4 right-4"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Device Info */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {getDeviceIcon()}
              <span className="font-medium">{deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}</span>
              <Badge variant="outline">{browser}</Badge>
            </div>
            <div className="flex items-center gap-2">
              {permissionStatus.icon}
              <Badge className={permissionStatus.color}>{permissionStatus.text}</Badge>
            </div>
          </div>

          {/* iOS Special Instructions */}
          {isIOS && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>iOS Users</AlertTitle>
              <AlertDescription>
                <div className="space-y-2">
                  <p>For notifications to work on iOS, you need to:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Add this app to your home screen</li>
                    <li>Open the app from your home screen (not Safari)</li>
                    <li>Grant notification permissions when prompted</li>
                  </ol>
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'DailyBuddy',
                          text: 'Add DailyBuddy to your home screen for notifications!',
                          url: window.location.href
                        })
                      }
                    }}>
                      <Share2 className="mr-1 h-3 w-3" />
                      Share to Add
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* PWA Installation Status */}
          {!isPWAInstalled && deviceType === "mobile" && (
            <Alert>
              <Home className="h-4 w-4" />
              <AlertTitle>Install App for Better Experience</AlertTitle>
              <AlertDescription>
                Installing DailyBuddy as a PWA will provide better notification support and app-like experience.
              </AlertDescription>
            </Alert>
          )}

          {/* Permission Request */}
          {permissionState !== "granted" && (
            <div className="space-y-3">
              <h3 className="font-semibold">Step 1: Enable Notifications</h3>
              <Button 
                onClick={requestPermission}
                className="w-full"
                disabled={permissionState === "denied"}
              >
                <Bell className="mr-2 h-4 w-4" />
                {permissionState === "denied" ? "Permission Denied" : "Enable Notifications"}
              </Button>
              {permissionState === "denied" && (
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertTitle>Permission Denied</AlertTitle>
                  <AlertDescription>
                    Please enable notifications in your browser settings:
                    <br />
                    <strong>Chrome/Edge:</strong> Settings → Privacy → Site Settings → Notifications
                    <br />
                    <strong>Firefox:</strong> Settings → Privacy → Permissions → Notifications
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Test Notifications */}
          {permissionState === "granted" && (
            <div className="space-y-3">
              <Separator />
              <h3 className="font-semibold">Step 2: Test Notifications</h3>
              <Button 
                onClick={testNotification}
                variant="outline"
                className="w-full"
              >
                <Bell className="mr-2 h-4 w-4" />
                Send Test Notification
              </Button>
              {fcmToken && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>FCM Token Received</AlertTitle>
                  <AlertDescription>
                    Your device is ready to receive push notifications even when the app is closed!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Status Messages */}
          {testMessage && (
            <Alert>
              <AlertDescription>{testMessage}</AlertDescription>
            </Alert>
          )}

          {/* How It Works */}
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold">How Push Notifications Work</h3>
            <div className="text-sm space-y-1 text-gray-600">
              <p>✅ <strong>App Open:</strong> Notifications work immediately</p>
              <p>✅ <strong>App in Background:</strong> Notifications work with sound</p>
              <p>✅ <strong>App Closed:</strong> Notifications work on most devices</p>
              <p>⚠️ <strong>iOS:</strong> Requires app to be added to home screen</p>
              <p>⚠️ <strong>Android:</strong> May be affected by battery optimization</p>
            </div>
          </div>

          {/* Troubleshooting */}
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold">Troubleshooting</h3>
            <div className="text-sm space-y-1 text-gray-600">
              <p><strong>No notifications when app is closed?</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Check battery optimization settings</li>
                <li>Ensure notifications are enabled in system settings</li>
                <li>Try restarting your device</li>
                <li>On Android: Go to Settings → Apps → DailyBuddy → Battery → Allow background activity</li>
              </ul>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={() => setIsOpen(false)} variant="outline">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Help Modal */}
      <NotificationHelpModal 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
      />
    </div>
  )
} 