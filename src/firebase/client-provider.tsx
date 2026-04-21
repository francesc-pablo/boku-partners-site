'use client';

import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useState,
  useEffect,
  DependencyList,
} from 'react';
// Use type imports for Firebase, which are stripped out at build time
import type { FirebaseApp } from 'firebase/app';
import type { Auth, User } from 'firebase/auth';
import type {
  Firestore,
  Query,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
  DocumentReference,
  DocumentSnapshot,
} from 'firebase/firestore';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Define types for the dynamically loaded functions
type DocFn = typeof import('firebase/firestore').doc;
type CollectionFn = typeof import('firebase/firestore').collection;
type OnSnapshotFn = typeof import('firebase/firestore').onSnapshot;


// Combined state for the Firebase context
export interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  fns: {
      doc: DocFn | null;
      collection: CollectionFn | null;
      onSnapshot: OnSnapshotFn | null;
  }
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(
  undefined
);

interface FirebaseServices {
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
    doc: DocFn;
    collection: CollectionFn;
    onSnapshot: OnSnapshotFn;
}

export function FirebaseClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    // This effect runs only once on the client-side
    const initialize = async () => {
        try {
            // Dynamically import Firebase modules only when this component mounts in the browser
            const { initializeApp, getApps, getApp } = await import('firebase/app');
            const { getAuth, onAuthStateChanged } = await import('firebase/auth');
            const { getFirestore, doc, collection, onSnapshot } = await import('firebase/firestore');
            const { firebaseConfig } = await import('@/firebase/config');

            const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
            const auth = getAuth(app);
            const firestore = getFirestore(app);

            setServices({ firebaseApp: app, auth, firestore, doc, collection, onSnapshot });

            const unsubscribe = onAuthStateChanged(
                auth,
                (firebaseUser) => {
                    setUser(firebaseUser);
                    setIsUserLoading(false);
                },
                (error) => {
                    console.error('Firebase Auth Error:', error);
                    setUserError(error);
                    setIsUserLoading(false);
                }
            );
            return unsubscribe;
        } catch (error) {
            console.error("Firebase initialization error:", error);
            setIsUserLoading(false);
            setUserError(error instanceof Error ? error : new Error('Failed to initialize Firebase'));
            return () => {};
        }
    };

    const unsubscribePromise = initialize();

    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe());
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  const contextValue = useMemo((): FirebaseContextState => {
    return {
      firebaseApp: services?.firebaseApp || null,
      firestore: services?.firestore || null,
      auth: services?.auth || null,
      user,
      isUserLoading: isUserLoading || !services, // Also loading while services are not initialized
      userError,
      fns: {
          doc: services?.doc || null,
          collection: services?.collection || null,
          onSnapshot: services?.onSnapshot || null
      }
    };
  }, [services, user, isUserLoading, userError]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}

// Hooks
function useFirebaseInternal() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  return context;
}

export const useFirebase = () => useFirebaseInternal();
export const useAuth = (): Auth => {
    const auth = useFirebaseInternal().auth;
    if (!auth) {
        throw new Error("Firebase Auth has not been initialized yet. Make sure you are using this hook within a component wrapped by FirebaseClientProvider and that it has mounted.");
    }
    return auth;
};
export const useFirestore = (): Firestore => {
    const firestore = useFirebaseInternal().firestore;
     if (!firestore) {
        throw new Error("Firebase Firestore has not been initialized yet. Make sure you are using this hook within a component wrapped by FirebaseClientProvider and that it has mounted.");
    }
    return firestore;
};
export const useFirebaseApp = (): FirebaseApp => {
    const firebaseApp = useFirebaseInternal().firebaseApp;
     if (!firebaseApp) {
        throw new Error("Firebase App has not been initialized yet. Make sure you are using this hook within a component wrapped by FirebaseClientProvider and that it has mounted.");
    }
    return firebaseApp;
};

// Return type for useUser()
export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const useUser = (): UserHookResult => {
    const { user, isUserLoading, userError } = useFirebaseInternal();
    return { user, isUserLoading, userError };
};

// New hook to get firestore functions
export const useFirestoreFns = () => {
    const { fns } = useFirebaseInternal();
    return fns;
};


type MemoFirebase<T> = T & { __memo?: boolean };
export function useMemoFirebase<T>(
  factory: () => T,
  deps: DependencyList
): T | MemoFirebase<T> {
  const memoized = useMemo(factory, deps);
  if (typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  return memoized;
}


// HOOKS CONSOLIDATED HERE

export type WithId<T> = T & { id: string };

// useCollection Hook
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & {__memo?: boolean})  | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  const { onSnapshot } = useFirestoreFns(); // Get the function from our new hook

  useEffect(() => {
    if (!memoizedTargetRefOrQuery || !onSnapshot) { // Check if onSnapshot is loaded
      setData(null);
      setIsLoading(!onSnapshot); // If onSnapshot isn't loaded, we are loading
      setError(null);
      return () => {};
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ResultItemType[] = [];
        for (const doc of snapshot.docs) {
          results.push({ ...(doc.data() as T), id: doc.id });
        }
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        const path: string =
          memoizedTargetRefOrQuery.type === 'collection'
            ? (memoizedTargetRefOrQuery as CollectionReference).path
            : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString()

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        })

        setError(contextualError)
        setData(null)
        setIsLoading(false)
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery, onSnapshot]); // Add onSnapshot to dependency array

  if(memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error(String(memoizedTargetRefOrQuery) + ' was not properly memoized using useMemoFirebase');
  }
  return { data, isLoading, error };
}


// useDoc Hook
export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

export function useDoc<T = any>(
  memoizedDocRef: (DocumentReference<DocumentData> & {__memo?: boolean}) | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  const { onSnapshot } = useFirestoreFns(); // Get the function from our new hook

  useEffect(() => {
    if (!memoizedDocRef || !onSnapshot) { // Check if onSnapshot is loaded
      setData(null);
      setIsLoading(!onSnapshot); // If onSnapshot isn't loaded, we are loading
      setError(null);
      return () => {};
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        })

        setError(contextualError)
        setData(null)
        setIsLoading(false)
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef, onSnapshot]); // Add onSnapshot to dependency array

  if(memoizedDocRef && !memoizedDocRef.__memo) {
    throw new Error(memoizedDocRef.path + ' was not properly memoized using useMemoFirebase');
  }

  return { data, isLoading, error };
}
