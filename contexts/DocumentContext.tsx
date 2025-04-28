import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Document, Category, DocumentWithStatus } from '../types/document';
import { useUser } from './UserContext';

type DocumentStatus = 'active' | 'expiring' | 'expired';

interface DocumentContextType {
    documents: DocumentWithStatus[];
    categories: Category[];
    loading: boolean;
    error: string | null;
    addDocument: (document: Omit<Document, 'id'>) => Promise<string>;
    updateDocument: (id: string, document: Partial<Document>) => Promise<void>;
    deleteDocument: (id: string) => Promise<void>;
    refreshDocuments: () => Promise<void>;
    refreshCategories: () => Promise<void>;
    addCategory: (category: Omit<Category, 'id'>) => Promise<string>;
}

const DocumentContext = createContext<DocumentContextType>({
    documents: [],
    categories: [],
    loading: false,
    error: null,
    addDocument: async () => '',
    updateDocument: async () => { },
    deleteDocument: async () => { },
    refreshDocuments: async () => { },
    refreshCategories: async () => { },
    addCategory: async () => '',
});

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [documents, setDocuments] = useState<DocumentWithStatus[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();

    const calculateStatus = (expiryDate?: Date): DocumentStatus => {
        if (!expiryDate) return 'active';
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        if (expiryDate < now) return 'expired';
        if (expiryDate <= thirtyDaysFromNow) return 'expiring';
        return 'active';
    };

    const refreshDocuments = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            const q = query(
                collection(db, 'documents'),
                where('userId', '==', user.uid)
            );

            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs.map(doc => ({
                ...doc.data() as Document,
                id: doc.id,
                status: calculateStatus((doc.data() as Document).expiryDate)
            }));

            // Sort documents by createdAt after fetching
            docs.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

            setDocuments(docs);
        } catch (err) {
            setError('Failed to fetch documents');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const refreshCategories = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            const q = query(
                collection(db, 'categories'),
                where('userId', '==', user.uid)
            );

            const querySnapshot = await getDocs(q);
            const cats = querySnapshot.docs.map(doc => ({
                ...doc.data() as Category,
                id: doc.id
            }));

            // If no categories exist, create default categories
            if (cats.length === 0) {
                const defaultCategories = [
                    { name: 'Passport', icon: 'passport' },
                    { name: 'Driver License', icon: 'card-account-details' },
                    { name: 'ID Card', icon: 'card-account-details-outline' },
                    { name: 'Insurance', icon: 'shield-check' },
                    { name: 'Medical', icon: 'medical-bag' },
                    { name: 'Education', icon: 'school' },
                    { name: 'Work', icon: 'briefcase' },
                    { name: 'Other', icon: 'folder' }
                ];

                for (const category of defaultCategories) {
                    await addDoc(collection(db, 'categories'), {
                        ...category,
                        userId: user.uid,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }

                // Refresh categories after creating defaults
                return refreshCategories();
            }

            setCategories(cats);
        } catch (err) {
            setError('Failed to fetch categories');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addDocument = async (document: Omit<Document, 'id'>): Promise<string> => {
        if (!user) throw new Error('User not authenticated');

        try {
            setLoading(true);
            setError(null);

            const docRef = await addDoc(collection(db, 'documents'), {
                ...document,
                userId: user.uid,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await refreshDocuments();
            return docRef.id;
        } catch (err) {
            setError('Failed to add document');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateDocument = async (id: string, document: Partial<Document>) => {
        if (!user) throw new Error('User not authenticated');

        try {
            setLoading(true);
            setError(null);

            await updateDoc(doc(db, 'documents', id), {
                ...document,
                updatedAt: new Date()
            });

            await refreshDocuments();
        } catch (err) {
            setError('Failed to update document');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteDocument = async (id: string) => {
        if (!user) throw new Error('User not authenticated');

        try {
            setLoading(true);
            setError(null);

            await deleteDoc(doc(db, 'documents', id));
            await refreshDocuments();
        } catch (err) {
            setError('Failed to delete document');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const addCategory = async (category: Omit<Category, 'id'>): Promise<string> => {
        if (!user) throw new Error('User not authenticated');

        try {
            setLoading(true);
            setError(null);

            const docRef = await addDoc(collection(db, 'categories'), {
                ...category,
                userId: user.uid,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await refreshCategories();
            return docRef.id;
        } catch (err) {
            setError('Failed to add category');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            refreshDocuments();
            refreshCategories();
        }
    }, [user]);

    return (
        <DocumentContext.Provider value={{
            documents,
            categories,
            loading,
            error,
            addDocument,
            updateDocument,
            deleteDocument,
            refreshDocuments,
            refreshCategories,
            addCategory
        }}>
            {children}
        </DocumentContext.Provider>
    );
};

export const useDocuments = () => useContext(DocumentContext); 