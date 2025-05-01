import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type StorageMode = 'online' | 'offline';

interface StorageContextType {
    storageMode: StorageMode;
    setStorageMode: (mode: StorageMode) => Promise<void>;
    loading: boolean;
}

const StorageContext = createContext<StorageContextType>({
    storageMode: 'online',
    setStorageMode: async () => { },
    loading: true,
});

export const useStorage = () => useContext(StorageContext);

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [storageMode, setStorageModeState] = useState<StorageMode>('online');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStorageMode = async () => {
            try {
                const savedMode = await AsyncStorage.getItem('storageMode');
                if (savedMode) {
                    setStorageModeState(savedMode as StorageMode);
                }
            } catch (error) {
                console.error('Error loading storage mode:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStorageMode();
    }, []);

    const setStorageMode = async (mode: StorageMode) => {
        try {
            await AsyncStorage.setItem('storageMode', mode);
            setStorageModeState(mode);
        } catch (error) {
            console.error('Error saving storage mode:', error);
        }
    };

    return (
        <StorageContext.Provider value={{ storageMode, setStorageMode, loading }}>
            {children}
        </StorageContext.Provider>
    );
}; 