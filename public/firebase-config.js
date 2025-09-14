// Import the functions you need from Firebase SDK
// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDagvyKR4kw9UEeagK4a0sKHNqwJcfm2Ug",
  authDomain: "student-management-6f674.firebaseapp.com",
  projectId: "student-management-6f674",
  storageBucket: "student-management-6f674.firebasestorage.app",
  messagingSenderId: "243452338221",
  appId: "1:243452338221:web:ab5c2f5b2db4f3359558a4",
  measurementId: "G-C8Y3RXRB84"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);   // Firestore
export const auth = getAuth(app);      // Authentication