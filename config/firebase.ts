import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyBPVqzstaq1gCAhuwdR8AK3Ax9XgGDKrxk",
    authDomain: "pidocs-d31ad.firebaseapp.com",
    projectId: "pidocs-d31ad",
    storageBucket: "pidocs-d31ad.firebasestorage.app",
    messagingSenderId: "1076812447969",
    appId: "1:1076812447969:web:e23608d11241e716b437a0",
    measurementId: "G-G41LVBGR2V"
};

// Initialize Firebase only if it hasn't been initialized
let app;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

// Initialize Auth with memory persistence
let auth;
try {
    auth = initializeAuth(app);
} catch (error) {
    // If auth is already initialized, get the existing instance
    auth = getAuth(app);
}

// Initialize other Firebase services
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage }; 