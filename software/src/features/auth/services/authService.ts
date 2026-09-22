import { User } from "firebase/auth";
import {
  auth,
  database,
  ref,
  set,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "@/services/firebase";

export const subscribeToAuth = (onChange: (user: User | null) => void) => onAuthStateChanged(auth, onChange);

export const signUp = async (email: string, password: string, name: string, phone: string) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  await set(ref(database, `users/${credential.user.uid}`), {
    name,
    email,
    phone,
    createdAt: Date.now(),
  });
};

export const signIn = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);
export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);
