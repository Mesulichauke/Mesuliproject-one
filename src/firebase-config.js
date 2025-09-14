import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDagvyKR4kw9UEeagK4a0sKHNqwJcfm2Ug",
  authDomain: "student-management-6f674.firebaseapp.com",
  projectId: "student-management-6f674",
  storageBucket: "student-management-6f674.firebasestorage.app",
  messagingSenderId: "243452338221",
  appId: "1:243452338221:web:ab5c2f5b2db4f3359558a4",
  measurementId: "G-C8Y3RXRB84"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// analytics is browser-only
let analytics;
try {
  if (typeof window !== "undefined") analytics = getAnalytics(app);
} catch (e) {
  // ignore if analytics not available
}

// Fast health-check helper with timeout
async function reachable(url, ms = 1500) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    await fetch(url, { method: "GET", signal: controller.signal, cache: "no-store" });
    clearTimeout(id);
    return true;
  } catch {
    return false;
  }
}

export async function initEmulatorsIfAvailable() {
  const host = "localhost";
  const authPort = 9099;
  const firestorePort = 8080;
  const storagePort = 9199;

  const authUrl = `http://${host}:${authPort}/`;
  const firestoreUrl = `http://${host}:${firestorePort}/`;
  const storageUrl = `http://${host}:${storagePort}/`;

  const [authOk, fsOk, stOk] = await Promise.all([
    reachable(authUrl),
    reachable(firestoreUrl),
    reachable(storageUrl)
  ]);

  console.info("Emulator health check — auth:", authOk, "firestore:", fsOk, "storage:", stOk);

  if (authOk) {
    // use http://localhost:9099 for auth emulator
    connectAuthEmulator(auth, `http://${host}:${authPort}`, { disableWarnings: true });
    console.info("Connected to Auth emulator");
  }

  if (fsOk) {
    connectFirestoreEmulator(db, host, firestorePort);
    console.info("Connected to Firestore emulator");
  }

  if (stOk) {
    connectStorageEmulator(storage, host, storagePort);
    console.info("Connected to Storage emulator");
  }

  if (!authOk && !fsOk && !stOk) {
    console.warn("Firebase emulators appear to be offline — running against REAL Firebase project (or MOCK_MODE depending on your code).");
  }
}

// call initEmulatorsIfAvailable() early in app startup
// Example:
// initEmulatorsIfAvailable().catch(e => console.warn("Emulator init failed:", e));

export { app, auth, db, storage, analytics };