import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

async function retry(fn, retries = 3, delay = 500) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((res) => setTimeout(res, delay));
    return retry(fn, retries - 1, delay * 2);
  }
}

export async function register(email, password) {
  try {
    const userCred = await retry(() => createUserWithEmailAndPassword(auth, email, password));
    return { user: userCred.user };
  } catch (err) {
    if (err?.code === "auth/network-request-failed") {
      throw new Error("Network error: check internet, VPN/proxy/firewall, or browser extensions blocking requests.");
    }
    if (err?.code === "auth/email-already-in-use") {
      throw new Error("Email already in use.");
    }
    throw new Error(err?.message || "Registration failed.");
  }
}