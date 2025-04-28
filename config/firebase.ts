import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, browserLocalPersistence } from 'firebase/auth';
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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with persistence
const auth = initializeAuth(app, {
    persistence: browserLocalPersistence
});

// Initialize other Firebase services
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage }; 