import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebaseConfig, vapidKey } from './firebase-config';

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export async function requestFcmToken() {
  try {
    const token = await getToken(messaging, { vapidKey });
    return token;
  } catch (err) {
    console.error('FCM token error:', err);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  onMessage(messaging, callback);
} 