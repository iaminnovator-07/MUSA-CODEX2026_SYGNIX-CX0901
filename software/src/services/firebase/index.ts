import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push, get, query, orderByChild, limitToLast, startAt, endAt } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged, updateProfile } from "firebase/auth";

// ==============================================
// 🔧 PASTE YOUR FIREBASE CONFIG BELOW
// Go to Firebase Console → Project Settings → Your App → Config
// These are public/publishable keys — safe to store in code
// ==============================================
const firebaseConfig = {
  apiKey: "AIzaSyBgRxlf-EzmNeaf__fn6XcRhUbrHN_3iy4",
  authDomain: "machinesentinel-e61df.firebaseapp.com",
  databaseURL: "https://machinesentinel-e61df-default-rtdb.firebaseio.com",
  projectId: "machinesentinel-e61df",
  storageBucket: "machinesentinel-e61df.firebasestorage.app",
  messagingSenderId: "347349716454",
  appId: "1:347349716454:web:7f2db3c9fce7a19295da27",
  measurementId: "G-J871SD10D9"
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
