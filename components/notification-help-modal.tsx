"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Bell, 
  Smartphone, 
  Monitor, 
  Tablet, 
  HelpCircle,
  Settings,
  Home,
  Share2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react"

interface NotificationHelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationHelpModal({ isOpen, onClose }: NotificationHelpModalProps) {
  const [activeTab, setActiveTab] = useState<"ios" | "android" | "desktop" | "troubleshooting">("ios")

  if (!isOpen) return null

  const getDeviceType = () => {
    const userAgent = navigator.userAgent
    if (/Android/i.test(userAgent)) return "android"
    if (/iPad|iPhone|iPod/i.test(userAgent)) return "ios"
    return "desktop"
  }

  const deviceType = getDeviceType()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Notification Setup Help
          </CardTitle>
          <CardDescription>
            Complete guide to enable push notifications on your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Device Detection */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Device Detected</AlertTitle>
            <AlertDescription>
              We detected you're using a <strong>{deviceType === "ios" ? "iOS" : deviceType === "android" ? "Android" : "Desktop"}</strong> device. 
              Follow the instructions below for your device type.
            </AlertDescription>
          </Alert>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === "ios" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("ios")}
              className="flex items-center gap-1"
            >
              <Smartphone className="h-3 w-3" />
              iOS
            </Button>
            <Button
              variant={activeTab === "android" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("android")}
              className="flex items-center gap-1"
            >
              <Smartphone className="h-3 w-3" />
              Android
            </Button>
            <Button
              variant={activeTab === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("desktop")}
              className="flex items-center gap-1"
            >
              <Monitor className="h-3 w-3" />
              Desktop
            </Button>
            <Button
              variant={activeTab === "troubleshooting" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("troubleshooting")}
              className="flex items-center gap-1"
            >
              <Settings className="h-3 w-3" />
              Troubleshooting
            </Button>
          </div>

          <Separator />

          {/* iOS Instructions */}
          {activeTab === "ios" && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>iOS Requirements</AlertTitle>
                <AlertDescription>
                  iOS 16.4+ required. Notifications only work when the app is added to your home screen.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Step 1: Add to Home Screen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Tap the Share button <Share2 className="inline h-3 w-3" /> in Safari</li>
                      <li>Scroll down and tap "Add to Home Screen"</li>
                      <li>Tap "Add" to confirm</li>
                      <li>Open DailyBuddy from your home screen (not Safari)</li>
                    </ol>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'DailyBuddy',
                            text: 'Add DailyBuddy to your home screen for notifications!',
                            url: window.location.href
                          })
                        }
                      }}
                    >
                      <Share2 className="mr-1 h-3 w-3" />
                      Share to Add
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Step 2: Enable Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Open DailyBuddy from your home screen</li>
                      <li>Tap "Enable Notifications" when prompted</li>
                      <li>Tap "Allow" in the permission dialog</li>
                      <li>Test notifications to confirm setup</li>
                    </ol>
                    <div className="text-xs text-muted-foreground">
                      💡 If no prompt appears, go to Settings → Safari → Advanced → Website Data → Clear
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>iOS Notifications Work When:</AlertTitle>
                <AlertDescription>
                  ✅ App is opened from home screen (not Safari)<br/>
                  ✅ iOS 16.4 or later<br/>
                  ✅ Notifications are enabled in Settings<br/>
                  ✅ App is not in "Restricted" mode
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Android Instructions */}
          {activeTab === "android" && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Android Requirements</AlertTitle>
                <AlertDescription>
                  Chrome, Edge, or Firefox browser required. Works best when installed as PWA.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Step 1: Install App (Optional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Tap the menu button (⋮) in Chrome</li>
                      <li>Tap "Add to Home screen" or "Install app"</li>
                      <li>Tap "Add" to confirm</li>
                      <li>Open DailyBuddy from your home screen</li>
                    </ol>
                    <div className="text-xs text-muted-foreground">
                      💡 Installing as PWA provides better notification support
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Step 2: Enable Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Tap "Enable Notifications" in the app</li>
                      <li>Tap "Allow" in the permission dialog</li>
                      <li>Test notifications to confirm setup</li>
                      <li>Check battery optimization settings</li>
                    </ol>
                    <div className="text-xs text-muted-foreground">
                      💡 If notifications don't work when app is closed, check battery settings
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Android Battery Optimization</AlertTitle>
                <AlertDescription>
                  To ensure notifications work when app is closed:<br/>
                  Settings → Apps → DailyBuddy → Battery → Allow background activity
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Desktop Instructions */}
          {activeTab === "desktop" && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Desktop Requirements</AlertTitle>
                <AlertDescription>
                  Chrome, Edge, Firefox, or Safari browser required. Notifications work in browser tabs.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Step 1: Enable Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Click "Enable Notifications" in the app</li>
                      <li>Click "Allow" in the browser permission dialog</li>
                      <li>Test notifications to confirm setup</li>
                      <li>Keep the browser tab open for best results</li>
                    </ol>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Browser Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-2">
                      <p><strong>Chrome/Edge:</strong> Settings → Privacy → Site Settings → Notifications</p>
                      <p><strong>Firefox:</strong> Settings → Privacy → Permissions → Notifications</p>
                      <p><strong>Safari:</strong> Safari → Settings → Websites → Notifications</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Desktop Notifications Work When:</AlertTitle>
                <AlertDescription>
                  ✅ Browser tab is open (even in background)<br/>
                  ✅ Notifications are enabled in browser settings<br/>
                  ✅ System notifications are enabled<br/>
                  ✅ Browser is not in "Do Not Disturb" mode
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Troubleshooting */}
          {activeTab === "troubleshooting" && (
            <div className="space-y-4">
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertTitle>Common Issues</AlertTitle>
                <AlertDescription>
                  If notifications aren't working, try these solutions:
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>No Notifications When App is Closed</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-2">
                      <p><strong>Android:</strong> Check battery optimization settings</p>
                      <p><strong>iOS:</strong> Ensure app is opened from home screen</p>
                      <p><strong>Desktop:</strong> Keep browser tab open</p>
                      <p><strong>All:</strong> Check system notification settings</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Permission Denied</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-2">
                      <p><strong>Browser:</strong> Clear site data and try again</p>
                      <p><strong>Mobile:</strong> Go to device settings and enable manually</p>
                      <p><strong>iOS:</strong> Reset Safari website data</p>
                      <p><strong>All:</strong> Try a different browser</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>No Sound</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-2">
                      <p><strong>System:</strong> Check device volume and notification sounds</p>
                      <p><strong>Browser:</strong> Ensure browser has audio permissions</p>
                      <p><strong>App:</strong> Check if device is in silent mode</p>
                      <p><strong>Note:</strong> Custom sounds not supported on all devices</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Test Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-2">
                      <p><strong>In App:</strong> Use the test notification button</p>
                      <p><strong>Firebase:</strong> Send test from Firebase Console</p>
                      <p><strong>Browser:</strong> Check browser's notification test</p>
                      <p><strong>System:</strong> Verify system notification settings</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Still Having Issues?</AlertTitle>
                <AlertDescription>
                  Try refreshing the page, clearing browser cache, or using a different browser. 
                  Some devices may have additional restrictions based on manufacturer settings.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 