import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBPVqzstaq1gCAhuwdR8AK3Ax9XgGDKrxk",
    authDomain: "pidocs-d31ad.firebaseapp.com",
    projectId: "pidocs-d31ad",
    storageBucket: "pidocs-d31ad.firebasestorage.app",
    messagingSenderId: "1076812447969",
    appId: "1:1076812447969:web:e23608d11241e716b437a0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 