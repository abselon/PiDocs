import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Document, Category, DocumentWithStatus } from '../types/document';
import { useUser } from './UserContext';
import { Timestamp } from 'firebase/firestore';

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
    deleteCategory: (id: string, action: 'delete' | 'move', targetCategoryId?: string) => Promise<void>;
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
    deleteCategory: async () => { },
});

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [documents, setDocuments] = useState<DocumentWithStatus[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();

    const calculateStatus = (expiryDate?: Date | Timestamp): DocumentStatus => {
        if (!expiryDate) return 'active';

        const expiryDateTime = expiryDate instanceof Timestamp ? expiryDate.toDate() : expiryDate;
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        if (expiryDateTime < now) return 'expired';
        if (expiryDateTime <= thirtyDaysFromNow) return 'expiring';
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
            const docs = querySnapshot.docs.map(doc => {
                const data = doc.data() as Document;
                return {
                    ...data,
                    id: doc.id,
                    status: calculateStatus(data.expiryDate instanceof Timestamp ? data.expiryDate.toDate() : undefined)
                };
            });

            // Sort documents by createdAt in memory
            docs.sort((a, b) => {
                const timeA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
                const timeB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
                return timeB - timeA; // Sort in descending order (newest first)
            });

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
        if (!user) {
            console.error('User not authenticated in addDocument');
            throw new Error('User not authenticated');
        }

        try {
            console.log('DocumentContext: Starting document addition...');
            setLoading(true);
            setError(null);

            console.log('DocumentContext: User ID:', user.uid);

            // Add document to Firestore
            console.log('DocumentContext: Creating document in Firestore...');
            const docRef = await addDoc(collection(db, 'documents'), {
                ...document,
                userId: user.uid,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            console.log('DocumentContext: Document created with ID:', docRef.id);

            // Refresh documents list
            console.log('DocumentContext: Refreshing documents list...');
            await refreshDocuments();
            console.log('DocumentContext: Documents list refreshed');

            return docRef.id;
        } catch (err) {
            console.error('DocumentContext: Error adding document:', err);
            setError('Failed to add document');
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
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
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

    const deleteCategory = async (id: string, action: 'delete' | 'move', targetCategoryId?: string) => {
        if (!user) throw new Error('User not authenticated');

        try {
            setLoading(true);
            setError(null);

            // First, check if this is a default category
            const category = categories.find(c => c.id === id);
            if (!category) throw new Error('Category not found');

            // Default categories have specific names
            const defaultCategoryNames = [
                'Passport',
                'Driver License',
                'ID Card',
                'Insurance',
                'Medical',
                'Education',
                'Work',
                'Other'
            ];

            if (defaultCategoryNames.includes(category.name)) {
                throw new Error('Cannot delete default categories');
            }

            // Get all documents in this category
            const documentsInCategory = documents.filter(doc => doc.categoryId === id);

            if (action === 'delete') {
                // Delete all documents in the category
                for (const document of documentsInCategory) {
                    await deleteDoc(doc(db, 'documents', document.id));
                }
            } else if (action === 'move' && targetCategoryId) {
                // Move all documents to the target category
                for (const document of documentsInCategory) {
                    await updateDoc(doc(db, 'documents', document.id), {
                        categoryId: targetCategoryId
                    });
                }
            }

            // Delete the category
            await deleteDoc(doc(db, 'categories', id));

            await refreshCategories();
            await refreshDocuments();
        } catch (err) {
            setError('Failed to delete category');
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
            addCategory,
            deleteCategory
        }}>
            {children}
        </DocumentContext.Provider>
    );
};

export const useDocuments = () => useContext(DocumentContext); 