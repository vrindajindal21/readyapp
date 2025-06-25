// Enhanced Service Worker for rich push notifications
const CACHE_NAME = "productivity-app-v1"
const urlsToCache = ["/", "/dashboard", "/favicon.ico"]

// Firebase Cloud Messaging setup
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA899Qmrzd9Er-ArnCt1dPCsMFEatr7sX0",
  authDomain: "dailybuddy-8b42b.firebaseapp.com",
  projectId: "dailybuddy-8b42b",
  storageBucket: "dailybuddy-8b42b.appspot.com",
  messagingSenderId: "71487961386",
  appId: "1:71487961386:web:7f93cbc5efa7c88aea4653",
  measurementId: "G-FFHJFGZP5Y"
});

const messaging = firebase.messaging();

// Handle background push notifications from FCM
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || "DailyBuddy";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    tag: payload.data?.tag || 'default',
    renotify: true,
    requireInteraction: false,
    silent: false, // This enables the default notification sound
    vibrate: [200, 100, 200, 100, 200],
    timestamp: Date.now(),
    data: {
      url: payload.data?.url || "/dashboard",
      type: payload.data?.type || "notification",
      ...payload.data,
    },
    // Add actions if supported by the browser
    ...(payload.data?.actions && {
      actions: payload.data.actions
    })
  };

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle standard push events (fallback)
self.addEventListener("push", (event) => {
  let data = {
    title: "DailyBuddy",
    body: "You have a new notification",
    icon: "/android-chrome-192x192.png",
    badge: "/android-chrome-192x192.png",
    tag: "default",
    data: {},
  }

  try {
    if (event.data) {
      const pushData = event.data.json()
      data = { ...data, ...pushData }
    }
  } catch (e) {
    console.error("Error parsing push data:", e)
  }

  const options = {
    body: data.body,
    icon: data.icon || "/android-chrome-192x192.png",
    badge: data.badge || "/android-chrome-192x192.png",
    tag: data.tag || "default",
    renotify: true,
    requireInteraction: false,
    silent: false, // Enable default notification sound
    vibrate: [200, 100, 200, 100, 200],
    timestamp: Date.now(),
    data: {
      url: data.url || "/dashboard",
      type: data.type || "notification",
      ...data.data,
    },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  const notification = event.notification
  const action = event.action
  const data = notification.data

  // Close the notification
  notification.close()

  // Handle different actions
  if (action === "complete") {
    // Handle complete action
    console.log("Action completed")
  } else if (action === "snooze") {
    // Handle snooze action
    console.log("Action snoozed")
  } else {
    // Default action - open app
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        const targetUrl = data?.url || "/dashboard"
        
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl)
            return client.focus()
          }
        }
        
        // Open new window if no existing window found
        if (clients.openWindow) {
          return clients.openWindow(targetUrl)
        }
      }),
    )
  }
})

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  console.log("Notification dismissed", event.notification.tag)
})

// Cache management
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Handle fetch requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
