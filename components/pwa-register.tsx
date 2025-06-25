'use client'
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function PWARegister() {
  const { toast } = useToast();
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if PWA is already installed
    const checkInstallation = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || (window as any).navigator.standalone) {
        setIsInstalled(true);
      }
    };

    checkInstallation();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js", {
            scope: "/",
            updateViaCache: "none"
          })
          .then((registration) => {
            console.log("Service Worker registered successfully: ", registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    toast({
                      title: "App Update Available",
                      description: "A new version of DailyBuddy is available. Refresh to update.",
                    });
                  }
                });
              }
            });
          })
          .catch((registrationError) => {
            console.error("Service Worker registration failed: ", registrationError);
            toast({
              title: "Service Worker Error",
              description: "Some features may not work properly. Please refresh the page.",
              variant: "destructive"
            });
          });
      });
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      // Store the event for later use
      (window as any).deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      toast({
        title: "App Installed! 🎉",
        description: "DailyBuddy has been added to your home screen.",
      });
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  return null;
} 