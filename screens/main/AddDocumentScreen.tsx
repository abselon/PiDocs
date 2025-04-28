import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { Text, Card, useTheme, Button, TextInput, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import { spacing, typography, shadows } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDocuments } from '../../contexts/DocumentContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { Category, Document } from '../../types/document';

type Step = 'category' | 'upload' | 'metadata' | 'reminder';

interface DocumentForm {
    title: string;
    description: string;
    file: DocumentPicker.DocumentPickerAsset | null;
    expiryDate?: string;
}

interface CategoryForm {
    name: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const AddDocumentScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { categories, addDocument, addCategory } = useDocuments();
    const [currentStep, setCurrentStep] = useState<Step>('category');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [document, setDocument] = useState<DocumentForm>({
        title: '',
        description: '',
        file: null,
    });
    const [loading, setLoading] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState<keyof typeof MaterialCommunityIcons.glyphMap>('folder');
    const [error, setError] = useState<string | null>(null);
    const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
    const [newCategory, setNewCategory] = useState<CategoryForm>({
        name: '',
        icon: 'file-document' as keyof typeof MaterialCommunityIcons.glyphMap,
    });

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                setDocument(prev => ({
                    ...prev,
                    file: result.assets[0],
                    title: result.assets[0].name,
                }));
                setCurrentStep('metadata');
            }
        } catch (err) {
            setError('Failed to pick document');
        }
    };

    const uploadFile = async (file: DocumentPicker.DocumentPickerAsset) => {
        try {
            const response = await fetch(file.uri);
            const blob = await response.blob();
            const fileRef = ref(storage, `documents/${uuidv4()}`);
            await uploadBytes(fileRef, blob);
            return await getDownloadURL(fileRef);
        } catch (err) {
            setError('Failed to upload file');
            throw err;
        }
    };

    const handleSubmit = async () => {
        if (!document.file || !selectedCategory) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            const fileUrl = await uploadFile(document.file);

            const newDocument: Omit<Document, 'id'> = {
                title: document.title,
                description: document.description,
                fileUrl,
                fileType: document.file.mimeType,
                fileSize: document.file.size,
                categoryId: selectedCategory,
                userId: '', // This will be set by the context
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            if (document.expiryDate) {
                newDocument.expiryDate = new Date(document.expiryDate);
            }

            await addDocument(newDocument);
            navigation.goBack();
        } catch (err) {
            setError('Failed to save document');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            setLoading(true);
            const newCategory: Omit<Category, 'id'> = {
                name: newCategoryName.trim(),
                icon: newCategoryIcon,
                userId: '', // Will be set by the context
                description: ''
            };

            const categoryId = await addCategory(newCategory);
            setSelectedCategory(categoryId);
            setShowCategoryModal(false);
            setNewCategoryName('');
            setNewCategoryIcon('folder');
        } catch (err) {
            setError('Failed to create category');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => {
        const steps: Step[] = ['category', 'upload', 'metadata', 'reminder'];
        return (
            <View style={styles.stepIndicator}>
                {steps.map((step, index) => (
                    <React.Fragment key={step}>
                        <View style={[
                            styles.stepDot,
                            {
                                backgroundColor: currentStep === step
                                    ? theme.colors.primary
                                    : theme.colors.onSurfaceVariant,
                            }
                        ]} />
                        {index < steps.length - 1 && (
                            <View style={[
                                styles.stepLine,
                                {
                                    backgroundColor: currentStep === step
                                        ? theme.colors.primary
                                        : theme.colors.onSurfaceVariant,
                                }
                            ]} />
                        )}
                    </React.Fragment>
                ))}
            </View>
        );
    };

    const renderCategoryStep = () => (
        <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
                Choose Category
            </Text>
            <View style={styles.categoryGrid}>
                {categories.map(category => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.categoryCard,
                            {
                                backgroundColor: selectedCategory === category.id
                                    ? theme.colors.primary + '20'
                                    : theme.colors.surface,
                                borderColor: selectedCategory === category.id
                                    ? theme.colors.primary
                                    : 'transparent',
                            }
                        ]}
                        onPress={() => setSelectedCategory(category.id)}
                    >
                        <MaterialCommunityIcons
                            name={category.icon}
                            size={24}
                            color={theme.colors.primary}
                        />
                        <Text style={[styles.categoryName, { color: theme.colors.onSurface }]}>
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity
                    style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}
                    onPress={() => setShowCategoryModal(true)}
                >
                    <MaterialCommunityIcons
                        name="folder-plus"
                        size={24}
                        color={theme.colors.primary}
                    />
                    <Text style={[styles.categoryName, { color: theme.colors.primary }]}>
                        New Category
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderUploadStep = () => (
        <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
                Upload Document
            </Text>
            <TouchableOpacity
                style={[styles.uploadCard, { backgroundColor: theme.colors.surface }]}
                onPress={pickDocument}
            >
                <MaterialCommunityIcons
                    name="file-upload"
                    size={48}
                    color={theme.colors.primary}
                />
                <Text style={[styles.uploadText, { color: theme.colors.onSurface }]}>
                    Tap to upload a document
                </Text>
                <Text style={[styles.uploadSubtext, { color: theme.colors.onSurfaceVariant }]}>
                    or drag and drop (desktop only)
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderMetadataStep = () => (
        <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
                Document Details
            </Text>
            <Card style={[styles.inputCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                    <TextInput
                        label="Title"
                        value={document.title}
                        onChangeText={text => setDocument(prev => ({ ...prev, title: text }))}
                        style={styles.input}
                        mode="outlined"
                    />
                    <TextInput
                        label="Description"
                        value={document.description}
                        onChangeText={text => setDocument(prev => ({ ...prev, description: text }))}
                        style={styles.input}
                        mode="outlined"
                        multiline
                    />
                    <TextInput
                        label="Expiry Date"
                        value={document.expiryDate}
                        onChangeText={text => setDocument(prev => ({ ...prev, expiryDate: text }))}
                        style={styles.input}
                        mode="outlined"
                        placeholder="YYYY-MM-DD"
                    />
                </Card.Content>
            </Card>
        </View>
    );

    const renderReminderStep = () => (
        <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
                Set Reminder
            </Text>
            <Card style={[styles.inputCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                    <Text style={[styles.reminderText, { color: theme.colors.onSurfaceVariant }]}>
                        You will be notified 7 days before the document expires.
                    </Text>
                </Card.Content>
            </Card>
        </View>
    );

    const IconSelector: React.FC = () => {
        const icons: (keyof typeof MaterialCommunityIcons.glyphMap)[] = [
            'file-document-outline',
            'file-pdf-box',
            'file-image-outline',
            'file-word-box',
            'file-excel-box',
            'file-powerpoint-box',
            'folder-zip',
            'folder'
        ];

        return (
            <View style={styles.iconGrid}>
                {icons.map((icon) => (
                    <TouchableOpacity
                        key={icon}
                        style={[
                            styles.iconButton,
                            newCategoryIcon === icon && styles.selectedIcon
                        ]}
                        onPress={() => setNewCategoryIcon(icon)}
                    >
                        <MaterialCommunityIcons
                            name={icon}
                            size={24}
                            color={newCategoryIcon === icon ? '#fff' : '#000'}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                    Add Document
                </Text>
                {renderStepIndicator()}
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {currentStep === 'category' && renderCategoryStep()}
                {currentStep === 'upload' && renderUploadStep()}
                {currentStep === 'metadata' && renderMetadataStep()}
                {currentStep === 'reminder' && renderReminderStep()}
            </ScrollView>

            <View style={styles.footer}>
                {currentStep !== 'category' && (
                    <Button
                        mode="outlined"
                        onPress={() => setCurrentStep(prev => {
                            const steps: Step[] = ['category', 'upload', 'metadata', 'reminder'];
                            const currentIndex = steps.indexOf(prev);
                            return steps[currentIndex - 1];
                        })}
                        style={styles.button}
                    >
                        Back
                    </Button>
                )}
                <Button
                    mode="contained"
                    onPress={() => {
                        if (currentStep === 'reminder') {
                            handleSubmit();
                        } else {
                            setCurrentStep(prev => {
                                const steps: Step[] = ['category', 'upload', 'metadata', 'reminder'];
                                const currentIndex = steps.indexOf(prev);
                                return steps[currentIndex + 1];
                            });
                        }
                    }}
                    style={[styles.button, { flex: 1 }]}
                    loading={loading}
                    disabled={loading || (currentStep === 'category' && !selectedCategory)}
                >
                    {currentStep === 'reminder' ? 'Add Document' : 'Next'}
                </Button>
            </View>

            <Portal>
                <Modal
                    visible={showCategoryModal}
                    onDismiss={() => setShowCategoryModal(false)}
                    contentContainerStyle={[
                        styles.modal,
                        { backgroundColor: theme.colors.surface }
                    ]}
                >
                    <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                        New Category
                    </Text>
                    <TextInput
                        label="Category Name"
                        value={newCategoryName}
                        onChangeText={setNewCategoryName}
                        style={styles.modalInput}
                        mode="outlined"
                    />
                    <IconSelector />
                    <View style={styles.modalButtons}>
                        <Button
                            mode="outlined"
                            onPress={() => setShowCategoryModal(false)}
                            style={styles.modalButton}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleCreateCategory}
                            loading={loading}
                            disabled={!newCategoryName.trim()}
                            style={styles.modalButton}
                        >
                            Create
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    title: {
        fontSize: typography.h1.fontSize,
        fontWeight: 'bold' as const,
        marginBottom: spacing.md,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    stepLine: {
        width: 40,
        height: 2,
        marginHorizontal: spacing.xs,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.lg,
    },
    stepContent: {
        marginBottom: spacing.xl,
    },
    stepTitle: {
        fontSize: typography.h2.fontSize,
        fontWeight: '600' as const,
        marginBottom: spacing.lg,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -spacing.xs,
    },
    categoryCard: {
        width: '48%',
        margin: spacing.xs,
        padding: spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        ...shadows.small,
    },
    categoryName: {
        ...typography.body,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    uploadCard: {
        padding: spacing.xl,
        borderRadius: 12,
        alignItems: 'center',
        ...shadows.small,
    },
    uploadText: {
        ...typography.body,
        marginTop: spacing.md,
    },
    uploadSubtext: {
        ...typography.caption,
        marginTop: spacing.xs,
    },
    inputCard: {
        marginBottom: spacing.md,
        ...shadows.small,
    },
    input: {
        marginBottom: spacing.md,
    },
    reminderText: {
        ...typography.body,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    button: {
        marginHorizontal: spacing.xs,
    },
    modal: {
        margin: spacing.lg,
        padding: spacing.lg,
        borderRadius: 12,
    },
    modalTitle: {
        fontSize: typography.h2.fontSize,
        fontWeight: '600' as const,
        marginBottom: spacing.lg,
    },
    modalInput: {
        marginBottom: spacing.lg,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedIcon: {
        backgroundColor: '#000',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    modalButton: {
        marginLeft: spacing.sm,
    },
    label: {
        ...typography.body,
        marginBottom: spacing.sm,
    },
});

export default AddDocumentScreen; 