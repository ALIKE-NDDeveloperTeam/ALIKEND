import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDMGMKV8x5xjJ2V_RwDwimFCG3u-G42pfg",
  authDomain: "gen-lang-client-0165380635.firebaseapp.com",
  projectId: "gen-lang-client-0165380635",
  storageBucket: "gen-lang-client-0165380635.firebasestorage.app",
  messagingSenderId: "908595371826",
  appId: "1:908595371826:web:3a137a0891733ce013412b"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom database ID provided in the configuration
export const db = getFirestore(app, "ai-studio-ef2c786a-5a87-4872-82c0-f129e7301680");

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Apply custom OAuth parameters if needed (e.g., prompt consent)
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
appleProvider.addScope('email');
appleProvider.addScope('name');
