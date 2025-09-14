import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// IMPORTANT: replace the placeholders below with the Web app config for
// the Firebase project you selected (student-management-6f674).
const firebaseConfig = {
  apiKey: "<API_KEY>",
  authDomain: "student-management-6f674.firebaseapp.com",
  projectId: "student-management-6f674",
  storageBucket: "student-management-6f674.appspot.com",
  messagingSenderId: "<MESSAGING_SENDER_ID>",
  appId: "<APP_ID>",
  measurementId: "<MEASUREMENT_ID>"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics is browser-only; guard initialization
let analytics;
try {
  if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
  }
} catch (e) {
  console.warn("Firebase analytics not initialized:", e?.message || e);
}

const auth = getAuth(app);

export { app, auth, analytics };