import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, Modal as RNModal } from 'react-native';
import { Text, Card, useTheme, Button, TextInput, Portal, Modal, ActivityIndicator, IconButton } from 'react-native-paper';
import { spacing, typography, shadows } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDocuments } from '../../contexts/DocumentContext';
import { useUser } from '../../contexts/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Category, Document } from '../../types/document';
import CalendarPicker from 'react-native-calendar-picker';
import { Moment } from 'moment';
import { Timestamp } from 'firebase/firestore';

type Step = 'category' | 'upload' | 'metadata' | 'reminder';

interface DocumentForm {
    title: string;
    description: string;
    notes: string;
    file: DocumentPicker.DocumentPickerAsset | null;
    expiryDate?: Date;
}

interface CategoryForm {
    name: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const AddDocumentScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { categories, addDocument, addCategory } = useDocuments();
    const { user } = useUser();
    const [currentStep, setCurrentStep] = useState<Step>('category');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [document, setDocument] = useState<DocumentForm>({
        title: '',
        description: '',
        notes: '',
        file: null,
    });
    const [loading, setLoading] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date>(new Date());
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState<keyof typeof MaterialCommunityIcons.glyphMap>('folder');
    const [error, setError] = useState<string | null>(null);
    const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
    const [newCategory, setNewCategory] = useState<CategoryForm>({
        name: '',
        icon: 'file-document' as keyof typeof MaterialCommunityIcons.glyphMap,
    });

    console.log('AddDocumentScreen: Current user:', user ? {
        uid: user.uid,
        email: user.email,
        isAnonymous: user.isAnonymous
    } : 'No user');

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

    const handleSubmit = async () => {
        if (!document.file || !selectedCategory) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (!user) {
            Alert.alert('Error', 'You must be logged in to add a document');
            return;
        }

        // Check file size (750KB limit to account for base64 overhead)
        const MAX_SIZE = 750 * 1024; // 750KB
        if (document.file.size && document.file.size > MAX_SIZE) {
            Alert.alert(
                'Error',
                'File size exceeds 750KB limit. Please choose a smaller file.',
                [{ text: 'OK' }]
            );
            return;
        }

        try {
            console.log('Starting document submission...');
            setLoading(true);
            setError(null);

            // Read file as base64
            console.log('Reading file as base64...');
            const response = await fetch(document.file.uri);
            const blob = await response.blob();
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
            });
            reader.readAsDataURL(blob);
            const base64Data = await base64Promise;
            console.log('File converted to base64, size:', base64Data.length);

            // Check if base64 data exceeds Firestore limit
            if (base64Data.length > 1024 * 1024) { // 1MB
                Alert.alert(
                    'Error',
                    'File is too large after encoding. Please choose a smaller file.',
                    [{ text: 'OK' }]
                );
                return;
            }

            if (!document.file.name || !document.file.mimeType || !document.file.size) {
                Alert.alert('Error', 'Invalid file data');
                return;
            }

            const newDocument: Omit<Document, 'id'> = {
                title: document.title || document.file.name,
                description: document.description,
                notes: document.notes,
                fileData: base64Data,
                fileName: document.file.name,
                fileType: document.file.mimeType,
                fileSize: document.file.size,
                categoryId: selectedCategory,
                userId: user.uid,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            if (document.expiryDate) {
                // Check if date is in reasonable range (between now and 100 years from now)
                const now = new Date();
                const maxDate = new Date();
                maxDate.setFullYear(maxDate.getFullYear() + 100);

                if (document.expiryDate < now || document.expiryDate > maxDate) {
                    Alert.alert('Error', 'Date must be between now and 100 years from now');
                    return;
                }

                newDocument.expiryDate = Timestamp.fromDate(document.expiryDate);
            }

            console.log('Attempting to add document to Firestore...');
            const documentId = await addDocument(newDocument);
            console.log('Document added successfully with ID:', documentId);

            // Show success message and navigate back
            Alert.alert(
                'Success',
                'Document added successfully',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Navigate back to the previous screen
                            navigation.goBack();
                        }
                    }
                ]
            );
        } catch (err) {
            console.error('Document creation error:', err);
            Alert.alert(
                'Error',
                'Failed to save document. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            setError('Category name cannot be empty');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const newCategoryData: Omit<Category, 'id'> = {
                name: newCategoryName.trim(),
                icon: newCategoryIcon,
                userId: '', // Will be set by the context
                description: ''
            };

            const categoryId = await addCategory(newCategoryData);
            setSelectedCategory(categoryId);
            setShowCategoryModal(false);
            setNewCategoryName('');
            setNewCategoryIcon('folder');
        } catch (err) {
            console.error('Category creation error:', err);
            setError('Failed to create category. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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

    const renderDatePickerModal = () => {
        const minDate = new Date();
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 100);

        return (
            <Portal>
                <Modal
                    visible={showDatePicker}
                    onDismiss={() => setShowDatePicker(false)}
                    contentContainerStyle={[styles.datePickerModal, { backgroundColor: theme.colors.surface }]}
                >
                    <View style={styles.datePickerHeader}>
                        <Text style={[styles.datePickerTitle, { color: theme.colors.onSurface }]}>
                            Select Expiry Date
                        </Text>
                        <IconButton
                            icon="close"
                            size={24}
                            onPress={() => setShowDatePicker(false)}
                        />
                    </View>
                    <CalendarPicker
                        startFromMonday={true}
                        minDate={minDate}
                        maxDate={maxDate}
                        selectedDayColor={theme.colors.primary}
                        selectedDayTextColor={theme.colors.onPrimary}
                        todayBackgroundColor={theme.colors.surfaceVariant}
                        todayTextStyle={{ color: theme.colors.primary }}
                        textStyle={{ color: theme.colors.onSurface }}
                        previousTitle="Previous"
                        nextTitle="Next"
                        previousTitleStyle={{ color: theme.colors.primary }}
                        nextTitleStyle={{ color: theme.colors.primary }}
                        monthTitleStyle={{ color: theme.colors.onSurface }}
                        yearTitleStyle={{ color: theme.colors.onSurface }}
                        selectedStartDate={document.expiryDate}
                        onDateChange={(date: Moment | null) => {
                            if (date) {
                                try {
                                    const timestamp = date._d ? date._d.getTime() : date.valueOf();
                                    const selectedDate = new Date(timestamp);
                                    const now = new Date();

                                    if (selectedDate < now) {
                                        Alert.alert('Invalid Date', 'Please select a future date');
                                        return;
                                    }

                                    setDocument(prev => ({ ...prev, expiryDate: selectedDate }));
                                    setShowDatePicker(false);
                                } catch (error) {
                                    console.error('Error processing date:', error);
                                    Alert.alert('Error', 'Invalid date selection');
                                }
                            }
                        }}
                    />
                </Modal>
            </Portal>
        );
    };

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
                        label="Notes"
                        value={document.notes}
                        onChangeText={text => setDocument(prev => ({ ...prev, notes: text }))}
                        style={styles.input}
                        mode="outlined"
                        multiline
                        placeholder="Add searchable notes about this document"
                    />
                    <TouchableOpacity
                        style={[styles.datePickerButton, { borderColor: theme.colors.outline }]}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <View style={styles.datePickerContent}>
                            <MaterialCommunityIcons
                                name="calendar"
                                size={24}
                                color={theme.colors.primary}
                            />
                            <Text style={[styles.datePickerText, { color: theme.colors.onSurface }]}>
                                {document.expiryDate
                                    ? document.expiryDate.toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                    : 'Set Expiry Date'}
                            </Text>
                            {document.expiryDate && (
                                <IconButton
                                    icon="close"
                                    size={20}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        setDocument(prev => ({ ...prev, expiryDate: undefined }));
                                    }}
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                </Card.Content>
            </Card>
            {renderDatePickerModal()}
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
        datePickerModal: {
            margin: spacing.lg,
            padding: spacing.lg,
            borderRadius: 12,
            maxHeight: '80%',
        },
        datePickerHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.md,
        },
        datePickerTitle: {
            fontSize: 20,
            fontWeight: '600',
        },
        datePickerButton: {
            borderWidth: 1,
            borderRadius: 4,
            padding: spacing.sm,
            marginBottom: spacing.md,
        },
        datePickerContent: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
        },
        datePickerText: {
            flex: 1,
            fontSize: 16,
        },
    });

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

export default AddDocumentScreen; 