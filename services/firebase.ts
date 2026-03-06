import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

const firebaseConfig = {
    apiKey: "AIzaSyBMsymRRP6s-XLNlbbxmeRsGBQlr684oko",
    authDomain: "personalflow-2c5be.firebaseapp.com",
    projectId: "personalflow-2c5be",
    storageBucket: "personalflow-2c5be.firebasestorage.app",
    messagingSenderId: "1023007041770",
    appId: "1:1023007041770:web:1b21e4bc147b2f15a5cf93",
    measurementId: "G-LRX8QZ4G8J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = async () => {
    if (Capacitor.isNativePlatform()) return null;
    const supported = await isSupported();
    if (supported) {
        return getMessaging(app);
    }
    return null;
};

// VAPID Key para enviar as notificacoes
export const VAPID_KEY = "BNsGQ7Eg-ozSlG0A-OmXOMTW08wVVQZ5ie43k_tSequFOO8AB9Cb66wCuf7cZO5pPk0dV84KbCdgJ7iA8uoqie0";

export const requestNotificationPermission = async () => {
    // 1. Caso seja Plataforma Nativa (Android/iOS)
    if (Capacitor.isNativePlatform()) {
        try {
            let permStatus = await PushNotifications.checkPermissions();

            if (permStatus.receive === 'prompt') {
                permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive !== 'granted') {
                console.warn('User denied permissions for native notifications');
                return null;
            }

            await PushNotifications.register();

            return new Promise<string | null>((resolve) => {
                PushNotifications.addListener('registration', (token) => {
                    console.log('Push registration success, token: ' + token.value);
                    resolve(token.value);
                });

                PushNotifications.addListener('registrationError', (err) => {
                    console.error('Registration error: ', err);
                    resolve(null);
                });

                // Timeout de segurança caso o listener demore (comum em emuladores)
                setTimeout(() => resolve(null), 10000);
            });
        } catch (err) {
            console.error('Native registration error: ', err);
            return null;
        }
    }

    // 2. Caso seja Web (Navegador)
    try {
        const msg = await messaging();
        if (!msg) {
            console.warn("Firebase Messaging is not supported in this environment.");
            return null;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const currentToken = await getToken(msg, { vapidKey: VAPID_KEY });
            return currentToken || null;
        } else {
            console.warn('Notification permission not granted.');
            return null;
        }
    } catch (err) {
        console.error('An error occurred while retrieving web token. ', err);
        return null;
    }
};

export const onMessageListener = async () => {
    if (Capacitor.isNativePlatform()) {
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push received: ', notification);
        });
        return null;
    }

    const msg = await messaging();
    if (!msg) return null;

    return new Promise((resolve) => {
        onMessage(msg, (payload) => {
            resolve(payload);
        });
    });
};
