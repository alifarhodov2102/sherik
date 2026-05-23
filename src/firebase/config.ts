


// src/firebase/config.ts
import { initializeApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyDnx328cl5cs8usaejxQhOhIMOeMAsgf6c",
  authDomain: "sherik-f451e.firebaseapp.com",
  projectId: "sherik-f451e",
  storageBucket: "sherik-f451e.firebasestorage.app",
  messagingSenderId: "870935799321",
  appId: "1:870935799321:web:beca0d936f62f65f962c88",
  measurementId: "G-D5X8V3BFPY"
};
const app = initializeApp(firebaseConfig);

// Smart authentication that won't crash the web browser!
export const auth = initializeAuth(app, {
  persistence: Platform.OS === 'web' 
    ? browserLocalPersistence 
    : getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;