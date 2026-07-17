import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Actual Firebase config from user
const firebaseConfig = {
  apiKey: "AIzaSyAJdsJMa8cSSXBjow4fuAnjfO9kYj_MEe0",
  authDomain: "royal-apostolic-church-system.firebaseapp.com",
  projectId: "royal-apostolic-church-system",
  storageBucket: "royal-apostolic-church-system.firebasestorage.app",
  messagingSenderId: "417491613554",
  appId: "1:417491613554:web:b1c5d531d7bbccc5634feb",
  measurementId: "G-MDPG6GJDD9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
