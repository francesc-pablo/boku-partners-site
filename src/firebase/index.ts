// This file acts as a barrel file for Firebase-related modules.

// Re-export the core provider and hooks from the client-provider.
export {
  FirebaseClientProvider,
  useFirebase,
  useFirebaseApp,
  useAuth,
  useFirestore,
  useUser,
  useFirestoreFns,
  useMemoFirebase,
  useCollection,
  useDoc,
  type UserHookResult,
} from './client-provider';