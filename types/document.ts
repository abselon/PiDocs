import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Timestamp } from 'firebase/firestore';

export interface DocumentMetadata {
    title: string;
    name: string;
    description?: string;
    expiryDate?: Timestamp;
    categoryId: string;
    userId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    customFields?: Record<string, any>;
}

export interface Document extends DocumentMetadata {
    id: string;
    fileData: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    categoryId: string;
    userId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    expiryDate?: Timestamp;
}

export interface Category {
    id: string;
    name: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    description?: string;
    userId: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export type DocumentStatus = 'active' | 'expiring' | 'expired';

export interface DocumentWithStatus extends Document {
    status: DocumentStatus;
} 