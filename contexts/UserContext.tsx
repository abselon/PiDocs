import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, updateProfile, Auth, AuthError, ErrorFn } from 'firebase/auth';
import { auth as firebaseAuth } from '../config/firebase';

const auth = firebaseAuth as Auth;

interface UserProfile {
    displayName?: string;
    photoURL?: string | null;
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    logout: () => Promise<void>;
    updateUserProfile: (profile: UserProfile) => Promise<void>;
}

const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    error: null,
    logout: async () => { },
    updateUserProfile: async () => { },
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(
            (authUser: User | null) => {
                setUser(authUser);
                setLoading(false);
            },
            ((error: Error) => {
                console.error('Auth state change error:', error);
                setError(error.message);
                setLoading(false);
            }) as ErrorFn
        );

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const updateUserProfile = async (profile: UserProfile) => {
        try {
            if (!user) throw new Error('No user logged in');
            await updateProfile(user, profile);
            // Force a refresh of the user object
            setUser({ ...user });
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    };

    return (
        <UserContext.Provider
            value={{
                user,
                loading,
                error,
                logout,
                updateUserProfile,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserContext; 