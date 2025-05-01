import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Document, Category, DocumentWithStatus } from '../types/document';
import { useUser } from './UserContext';
import { useStorage } from './StorageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const { storageMode } = useStorage();

    const calculateStatus = (expiryDate?: Date | Timestamp): DocumentStatus => {
        if (!expiryDate) return 'active';

        const expiryDateTime = expiryDate instanceof Timestamp ? expiryDate.toDate() : expiryDate;
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        if (expiryDateTime < now) return 'expired';
        if (expiryDateTime <= thirtyDaysFromNow) return 'expiring';
        return 'active';
    };

    const loadOfflineData = async () => {
        try {
            const storedDocs = await AsyncStorage.getItem('offline_documents');
            const storedCats = await AsyncStorage.getItem('offline_categories');

            if (storedDocs) {
                const parsedDocs = JSON.parse(storedDocs);
                setDocuments(parsedDocs.map((doc: Document) => ({
                    ...doc,
                    status: calculateStatus(doc.expiryDate ? (doc.expiryDate instanceof Timestamp ? doc.expiryDate.toDate() : new Date(doc.expiryDate)) : undefined)
                })));
            }

            if (storedCats) {
                setCategories(JSON.parse(storedCats));
            }
        } catch (error) {
            console.error('Error loading offline data:', error);
        }
    };

    const saveOfflineData = async (docs: DocumentWithStatus[], cats: Category[]) => {
        try {
            await AsyncStorage.setItem('offline_documents', JSON.stringify(docs));
            await AsyncStorage.setItem('offline_categories', JSON.stringify(cats));
        } catch (error) {
            console.error('Error saving offline data:', error);
        }
    };

    const refreshDocuments = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            if (storageMode === 'offline') {
                await loadOfflineData();
                return;
            }

            const q = query(
                collection(db, 'documents'),
                where('userId', '==', user.uid)
            );

            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs.map(doc => {
                const data = doc.data() as Document;
                return {
                    ...data,
                    id: doc.id,
                    status: calculateStatus(data.expiryDate instanceof Timestamp ? data.expiryDate.toDate() : undefined)
                };
            });

            docs.sort((a, b) => {
                const timeA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
                const timeB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
                return timeB - timeA;
            });

            setDocuments(docs);
            await saveOfflineData(docs, categories);
        } catch (err) {
            if (storageMode === 'offline') {
                await loadOfflineData();
            } else {
                setError('Failed to fetch documents');
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    };

    const refreshCategories = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            if (storageMode === 'offline') {
                await loadOfflineData();
                return;
            }

            const q = query(
                collection(db, 'categories'),
                where('userId', '==', user.uid)
            );

            const querySnapshot = await getDocs(q);
            const cats = querySnapshot.docs.map(doc => ({
                ...doc.data() as Category,
                id: doc.id
            }));

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

                return refreshCategories();
            }

            setCategories(cats);
            await saveOfflineData(documents, cats);
        } catch (err) {
            if (storageMode === 'offline') {
                await loadOfflineData();
            } else {
                setError('Failed to fetch categories');
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    };

    const addDocument = async (document: Omit<Document, 'id'>) => {
        if (!user) throw new Error('No user logged in');

        try {
            if (storageMode === 'online') {
                const docRef = await addDoc(collection(db, 'documents'), {
                    ...document,
                    userId: user.uid,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
                await refreshDocuments();
                return docRef.id;
            } else {
                const newDoc: DocumentWithStatus = {
                    ...document,
                    id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    userId: user.uid,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    status: calculateStatus(document.expiryDate)
                };

                const updatedDocs = [...documents, newDoc];
                setDocuments(updatedDocs);

                try {
                    await saveOfflineData(updatedDocs, categories);
                    console.log('Document saved offline successfully');
                } catch (storageError) {
                    console.error('Error saving document to AsyncStorage:', storageError);
                    setDocuments(documents);
                    throw new Error('Failed to save document offline');
                }

                return newDoc.id;
            }
        } catch (error) {
            console.error('Error adding document:', error);
            throw error;
        }
    };

    const updateDocument = async (id: string, document: Partial<Document>) => {
        if (!user) throw new Error('No user logged in');

        try {
            if (storageMode === 'online') {
                await updateDoc(doc(db, 'documents', id), {
                    ...document,
                    updatedAt: Timestamp.now()
                });
                await refreshDocuments();
            } else {
                // Create a backup of current documents
                const currentDocs = [...documents];

                // Optimistically update local state
                const updatedDocs = documents.map(doc =>
                    doc.id === id
                        ? {
                            ...doc,
                            ...document,
                            updatedAt: Timestamp.now(),
                            status: calculateStatus(document.expiryDate || doc.expiryDate)
                        }
                        : doc
                );
                setDocuments(updatedDocs);

                try {
                    await saveOfflineData(updatedDocs, categories);
                    console.log('Document updated offline successfully');
                } catch (storageError) {
                    console.error('Error saving document to AsyncStorage:', storageError);
                    // Revert to previous state if save fails
                    setDocuments(currentDocs);
                    throw new Error('Failed to save document offline');
                }
            }
        } catch (error) {
            console.error('Error updating document:', error);
            throw error;
        }
    };

    const deleteDocument = async (id: string) => {
        if (!user) throw new Error('No user logged in');

        try {
            if (storageMode === 'online') {
                await deleteDoc(doc(db, 'documents', id));
                await refreshDocuments();
            } else {
                // Create a backup of current documents
                const currentDocs = [...documents];

                // Optimistically update local state
                const updatedDocs = documents.filter(doc => doc.id !== id);
                setDocuments(updatedDocs);

                try {
                    await saveOfflineData(updatedDocs, categories);
                    console.log('Document deleted offline successfully');
                } catch (storageError) {
                    console.error('Error saving document deletion to AsyncStorage:', storageError);
                    // Revert to previous state if save fails
                    setDocuments(currentDocs);
                    throw new Error('Failed to delete document offline');
                }
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    };

    const addCategory = async (category: Omit<Category, 'id'>) => {
        if (!user) throw new Error('No user logged in');

        try {
            if (storageMode === 'online') {
                const catRef = await addDoc(collection(db, 'categories'), {
                    ...category,
                    userId: user.uid,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
                await refreshCategories();
                return catRef.id;
            } else {
                // Create a backup of current categories
                const currentCats = [...categories];

                const newCat: Category = {
                    ...category,
                    id: `offline_cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    userId: user.uid,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                };

                // Optimistically update local state
                const updatedCats = [...categories, newCat];
                setCategories(updatedCats);

                try {
                    await saveOfflineData(documents, updatedCats);
                    console.log('Category added offline successfully');
                    return newCat.id;
                } catch (storageError) {
                    console.error('Error saving category to AsyncStorage:', storageError);
                    // Revert to previous state if save fails
                    setCategories(currentCats);
                    throw new Error('Failed to save category offline');
                }
            }
        } catch (error) {
            console.error('Error adding category:', error);
            throw error;
        }
    };

    // Load initial data
    useEffect(() => {
        refreshDocuments();
        refreshCategories();
    }, [user, storageMode]);

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