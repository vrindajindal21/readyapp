import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebaseConfig, vapidKey } from './firebase-config';

let app: any = null;
let messaging: any = null;

// Only initialize Firebase on the client side
if (typeof window !== 'undefined') {
  app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
}

export { messaging };

export async function requestFcmToken() {
  if (typeof window === 'undefined' || !messaging) {
    return null;
  }
  
  try {
    const token = await getToken(messaging, { vapidKey });
    return token;
  } catch (err) {
    console.error('FCM token error:', err);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  if (typeof window === 'undefined' || !messaging) {
    return;
  }
  
  onMessage(messaging, callback);
} 