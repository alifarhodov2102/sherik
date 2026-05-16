// src/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// REPLACE THESE WITH YOUR ACTUAL KEYS FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyDnx328cl5cs8usaejxQhOhIMOeMAsgf6c",
  authDomain: "sherik-f451e.firebaseapp.com",
  projectId: "sherik-f451e",
  storageBucket: "sherik-f451e.firebasestorage.app",
  messagingSenderId: "870935799321",
  appId: "1:870935799321:web:beca0d936f62f65f962c88",
  measurementId: "G-D5X8V3BFPY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;