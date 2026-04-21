'use client';

import { useFirestore, useMemoFirebase, useDoc, useFirestoreFns } from '@/firebase';

export interface PortalUser {
    id: string;
    clientId: string;
    email: string;
    role: 'Admin' | 'Boku_Access' | 'StandardUser';
    firstName: string;
    lastName: string;
    company?: string;
}

/**
 * A hook to fetch the PortalUser data for a given Firebase Auth UID.
 * It first finds the user's Client ID from the top-level user_to_client_map,
 * then fetches the detailed PortalUser document.
 * 
 * @param uid The Firebase Authentication User ID.
 * @returns An object with the portalUser data, loading state, and error.
 */
export function usePortalUser(uid: string | undefined) {
    const firestore = useFirestore();
    const { doc } = useFirestoreFns();

    // Step 1: Create a memoized reference to find the user's clientId from the map.
    const userClientMapRef = useMemoFirebase(() => {
        if (!firestore || !uid || !doc) return null;
        // This assumes a collection `user_to_client_map` exists at the root.
        // The document ID is the user's UID.
        return doc(firestore, 'user_to_client_map', uid);
    }, [firestore, uid, doc]);

    const { data: clientMap, isLoading: isMapLoading, error: mapError } = useDoc<{ clientId: string }>(userClientMapRef);

    const clientId = clientMap?.clientId;

    // Step 2: Create a memoized reference to the actual PortalUser document using the clientId.
    const portalUserRef = useMemoFirebase(() => {
        if (!firestore || !clientId || !uid || !doc) return null;
        return doc(firestore, 'clients', clientId, 'portalUsers', uid);
    }, [firestore, clientId, uid, doc]);
    
    const { data: portalUser, isLoading: isUserLoading, error: userError } = useDoc<PortalUser>(portalUserRef);

    const fnsLoading = !doc;

    return {
        portalUser,
        isLoading: isMapLoading || isUserLoading || fnsLoading,
        error: mapError || userError,
    };
}
