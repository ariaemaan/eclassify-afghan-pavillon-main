importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');
// // Initialize the Firebase app in the service worker by passing the generated config

const firebaseConfig = {
    apiKey: "AIzaSyDtVsREJIzjlK7OEGjY9DzN6ijM7aASXEM",
    authDomain: "mamla-62f51.firebaseapp.com",
    projectId: "mamla-62f51",
    storageBucket: "mamla-62f51.firebasestorage.app",
    messagingSenderId: "1021140366635",
    appId: "1:1021140366635:web:cdfae578d4c7ba9a29c16e",
    measurementId: "G-0HGLGJ6Y7Z"
};

firebase?.initializeApp(firebaseConfig)

// Retrieve firebase messaging
const messaging = firebase.messaging();

self.addEventListener('install', function (event) {
    console.log('Hello world from the Service Worker :call_me_hand:');
});
