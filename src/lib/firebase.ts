import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBJky-5BfuYVkLhGwkxCYEuX8_9fFz0IQ8",
  authDomain: "sarvaa-1ce5b.firebaseapp.com",
  projectId: "sarvaa-1ce5b",
  storageBucket: "sarvaa-1ce5b.firebasestorage.app",
  messagingSenderId: "1027319231917",
  appId: "1:1027319231917:web:04f56fe97c098534049d24",
  measurementId: "G-10FB5D2RS8",
};

// Initialize Firebase only if it hasn't been initialized
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth };
