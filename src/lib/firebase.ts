// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDY1NHVD-hfh9keBEh8D7Q-U67XUA_3ieE",
  authDomain: "boku-partners.firebaseapp.com",
  projectId: "boku-partners",
  storageBucket: "boku-partners.firebasestorage.app",
  messagingSenderId: "544593661550",
  appId: "1:544593661550:web:068de978a85cb6303fe07f",
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

const db = getFirestore(app);

export { db };
