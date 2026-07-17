import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('Admin'); // Default to Admin as requested

  async function syncUserToFirestore(user) {
    if (!user) return;
    
    // Fetch global settings to get default admin email
    const settingsSnap = await getDoc(doc(db, 'settings', 'general'));
    let defaultAdminEmail = '';
    
    if (settingsSnap.exists()) {
      defaultAdminEmail = settingsSnap.data().defaultAdminEmail;
    } else {
      // If no settings exist yet, the first person to log in becomes the default admin
      defaultAdminEmail = user.email;
      await setDoc(doc(db, 'settings', 'general'), {
        defaultAdminEmail: user.email,
        createdAt: new Date()
      });
    }

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    let currentRole = 'Staff'; // Default role for non-admins
    
    if (user.email === defaultAdminEmail) {
      currentRole = 'Admin';
    } else if (userSnap.exists()) {
      // If they are in the database, keep their current role UNLESS they were Admin and shouldn't be
      const dbRole = userSnap.data().role;
      currentRole = (dbRole === 'Admin') ? 'Staff' : (dbRole || 'Staff');
    }
    
    // Save/Update user in the database with their strictly enforced role
    await setDoc(userRef, {
      email: user.email,
      name: user.displayName || user.email.split('@')[0],
      role: currentRole,
      lastLogin: new Date()
    }, { merge: true });
    
    setUserRole(currentRole);
  }

  function login(email, password) {
    return setPersistence(auth, browserSessionPersistence).then(() => {
      return signInWithEmailAndPassword(auth, email, password);
    });
  }

  function register(email, password) {
    return setPersistence(auth, browserSessionPersistence).then(() => {
      return createUserWithEmailAndPassword(auth, email, password);
    });
  }

  function loginWithGoogle() {
    return setPersistence(auth, browserSessionPersistence).then(() => {
      const provider = new GoogleAuthProvider();
      return signInWithPopup(auth, provider);
    });
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserToFirestore(user);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    login,
    register,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
