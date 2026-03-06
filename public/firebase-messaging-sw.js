importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyBMsymRRP6s-XLNlbbxmeRsGBQlr684oko",
    authDomain: "personalflow-2c5be.firebaseapp.com",
    projectId: "personalflow-2c5be",
    storageBucket: "personalflow-2c5be.firebasestorage.app",
    messagingSenderId: "1023007041770",
    appId: "1:1023007041770:web:1b21e4bc147b2f15a5cf93",
    measurementId: "G-LRX8QZ4G8J"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title || 'Nova Notificação';
    const notificationOptions = {
        body: payload.notification.body || '',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: payload.data
    };

    self.registration.showNotification(notificationTitle,
        notificationOptions);
});
