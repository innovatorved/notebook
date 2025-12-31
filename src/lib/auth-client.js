/**
 * Better-Auth React Client
 * Provides hooks and methods for authentication in React components
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
});

// Export commonly used methods and hooks
export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession
} = authClient;
