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
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    userId: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    metadataTemplate?: Record<string, {
        type: 'text' | 'date' | 'number' | 'boolean';
        required: boolean;
        label: string;
    }>;
}

export type DocumentStatus = 'active' | 'expiring' | 'expired';

export interface DocumentWithStatus extends Document {
    status: DocumentStatus;
} 