import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { User } from 'firebase/auth';

interface UserContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
}

const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    error: null,
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(
            (user) => {
                setUser(user);
                setLoading(false);
            },
            (error) => {
                setError(error.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, error }}>
            {children}
        </UserContext.Provider>
    );
}; 