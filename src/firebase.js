import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Dummy Firebase configuration (safe for GitHub)
const firebaseConfig = {
  apiKey: "DUMMY_API_KEY",
  authDomain: "dummy-app.firebaseapp.com",
  projectId: "dummy-project-id",
  storageBucket: "dummy-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdefgh123456",
  measurementId: "G-12345678",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
