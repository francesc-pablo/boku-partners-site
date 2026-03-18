'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { auth, firestore } from '@/firebase/client';

interface UserProfile extends DocumentData {
    uid: string;
    email: string;
    role: 'admin' | 'user';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
      if (user) {
          const unsubProfile = onSnapshot(doc(firestore, "users", user.uid), (doc) => {
              if (doc.exists()) {
                  setUserProfile(doc.data() as UserProfile);
              } else {
                  setUserProfile(null);
              }
              setLoading(false);
          }, (error) => {
              console.error("Error fetching user profile:", error);
              setLoading(false);
          });
          return () => unsubProfile();
      }
  }, [user]);

  return { user, userProfile, loading };
}