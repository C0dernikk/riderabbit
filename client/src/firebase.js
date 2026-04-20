// Import the functions you need from the SDKs you need
import { initializeApp } from "@firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "riderabbit-270cb.firebaseapp.com",
  projectId: "riderabbit-270cb",
  storageBucket: "riderabbit-270cb.firebasestorage.app",
  messagingSenderId: "783671363723",
  appId: "1:783671363723:web:8d19ec0d5ca863e666ec8e",
  measurementId: "G-5D5MEQGCV8"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);