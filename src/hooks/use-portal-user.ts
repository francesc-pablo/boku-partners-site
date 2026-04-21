'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export interface PortalUser {
    id: string;
    clientId: string;
    email: string;
    role: 'Admin' | 'Boku_Access' | 'Client_Access';
    firstName: string;
    lastName: string;
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

    // Step 1: Create a memoized reference to find the user's clientId from the map.
    const userClientMapRef = useMemoFirebase(() => {
        if (!firestore || !uid) return null;
        // This assumes a collection `user_to_client_map` exists at the root.
        // The document ID is the user's UID.
        return doc(firestore, 'user_to_client_map', uid);
    }, [firestore, uid]);

    const { data: clientMap, isLoading: isMapLoading, error: mapError } = useDoc<{ clientId: string }>(userClientMapRef);

    const clientId = clientMap?.clientId;

    // Step 2: Create a memoized reference to the actual PortalUser document using the clientId.
    const portalUserRef = useMemoFirebase(() => {
        if (!firestore || !clientId || !uid) return null;
        return doc(firestore, 'clients', clientId, 'portalUsers', uid);
    }, [firestore, clientId, uid]);
    
    const { data: portalUser, isLoading: isUserLoading, error: userError } = useDoc<PortalUser>(portalUserRef);

    return {
        portalUser,
        isLoading: isMapLoading || isUserLoading,
        error: mapError || userError,
    };
}

    