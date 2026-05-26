// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcVOulqWo7VQ95Rg26fsI8VFm-i9y3HwY",
  authDomain: "gradgateway-c5b4b.firebaseapp.com",
  projectId: "gradgateway-c5b4b",
  storageBucket: "gradgateway-c5b4b.firebasestorage.app",
  messagingSenderId: "669241506635",
  appId: "1:669241506635:web:20203d435d1e33c561c6ce",
  measurementId: "G-T2H8Q31W4E"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth };
