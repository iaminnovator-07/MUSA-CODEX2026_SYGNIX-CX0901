import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push, get, query, orderByChild, limitToLast, startAt, endAt } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged, updateProfile } from "firebase/auth";

// ==============================================
// 🔧 PASTE YOUR FIREBASE CONFIG BELOW
// Go to Firebase Console → Project Settings → Your App → Config
// These are public/publishable keys — safe to store in code
// ==============================================
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export {
  database,
  auth,
  ref,
  onValue,
  set,
  push,
  get,
  query,
  orderByChild,
  limitToLast,
  startAt,
  endAt,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
};
