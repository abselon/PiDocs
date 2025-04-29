import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface DocumentMetadata {
    title: string;
    description?: string;
    expiryDate?: Date;
    categoryId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    customFields?: Record<string, any>;
}

export interface Document extends DocumentMetadata {
    id: string;
    notes?: string;
    fileData: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    categoryId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    expiryDate?: Date;
}

export interface Category {
    id: string;
    name: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    description?: string;
    userId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export type DocumentStatus = 'active' | 'expiring' | 'expired';

export interface DocumentWithStatus extends Document {
    status: DocumentStatus;
} 