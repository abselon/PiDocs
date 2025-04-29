import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, Modal as RNModal, Dimensions, Animated } from 'react-native';
import { Text, Card, useTheme, Button, TextInput, Portal, Modal, ActivityIndicator, IconButton } from 'react-native-paper';
import { spacing, typography, shadows } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDocuments } from '../../contexts/DocumentContext';
import { useUser } from '../../contexts/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Category, Document } from '../../types/document';
import CalendarPicker from 'react-native-calendar-picker';
import { Moment } from 'moment';
import { Timestamp } from 'firebase/firestore';

type Step = 'category' | 'upload' | 'metadata' | 'reminder';

interface DocumentForm {
    title: string;
    name: string;
    description: string;
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
    const route = useRoute();
    const { categories, addDocument, addCategory } = useDocuments();
    const { user } = useUser();
    const [currentStep, setCurrentStep] = useState<Step>('category');
    const [selectedCategory, setSelectedCategory] = useState<string>(route.params?.categoryId || '');
    const [document, setDocument] = useState<DocumentForm>({
        title: '',
        name: '',
        description: '',
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
    const scaleAnim = useRef(new Animated.Value(1)).current;

    console.log('AddDocumentScreen: Current user:', user ? {
        uid: user.uid,
        email: user.email,
        isAnonymous: user.isAnonymous
    } : 'No user');

    // If we have a pre-selected category, start at the upload step
    useEffect(() => {
        if (selectedCategory) {
            setCurrentStep('upload');
        }
    }, [selectedCategory]);

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
                name: document.name || document.title || document.file.name,
                description: document.description,
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

    const handlePress = (categoryId: string) => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setSelectedCategory(categoryId);
        });
    };

    const renderCategoryStep = () => {
        const screenWidth = Dimensions.get('window').width;
        const isSmallScreen = screenWidth < 600;
        const itemWidth = isSmallScreen ? '48%' : '30%';

        return (
            <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
                    Choose Category
                </Text>
                <View style={styles.categoryGrid}>
                    <View style={[styles.categoryItem, { flexBasis: itemWidth }]}>
                        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                            <TouchableOpacity
                                style={[
                                    styles.categoryCard,
                                    {
                                        backgroundColor: theme.colors.surface,
                                    }
                                ]}
                                onPress={() => {
                                    Animated.sequence([
                                        Animated.timing(scaleAnim, {
                                            toValue: 0.95,
                                            duration: 100,
                                            useNativeDriver: true,
                                        }),
                                        Animated.timing(scaleAnim, {
                                            toValue: 1,
                                            duration: 100,
                                            useNativeDriver: true,
                                        }),
                                    ]).start(() => {
                                        setShowCategoryModal(true);
                                    });
                                }}
                            >
                                <View style={styles.categoryIconContainer}>
                                    <MaterialCommunityIcons
                                        name="folder-plus"
                                        size={32}
                                        color={theme.colors.primary}
                                    />
                                </View>
                                <Text style={[styles.categoryName, { color: theme.colors.primary }]} numberOfLines={2}>
                                    New Category
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                    {categories.map(category => (
                        <View key={category.id} style={[styles.categoryItem, { flexBasis: itemWidth }]}>
                            <Animated.View style={{ transform: [{ scale: selectedCategory === category.id ? scaleAnim : 1 }] }}>
                                <TouchableOpacity
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
                                    onPress={() => handlePress(category.id)}
                                >
                                    <View style={styles.categoryIconContainer}>
                                        <MaterialCommunityIcons
                                            name={category.icon}
                                            size={32}
                                            color={theme.colors.primary}
                                        />
                                    </View>
                                    <Text style={[styles.categoryName, { color: theme.colors.onSurface }]} numberOfLines={2}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

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
                    contentContainerStyle={styles.datePickerModal}
                >
                    <View style={styles.datePickerHeader}>
                        <Text style={styles.datePickerTitle}>
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
                                    const timestamp = date.toDate().getTime();
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
                        style={styles.calendarStyle}
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
                        label="Name"
                        value={document.name}
                        onChangeText={text => setDocument(prev => ({ ...prev, name: text }))}
                        style={styles.input}
                        mode="outlined"
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
            justifyContent: 'space-between',
            paddingHorizontal: spacing.lg,
            marginTop: spacing.md,
        },
        categoryItem: {
            marginBottom: spacing.md,
        },
        categoryCard: {
            padding: spacing.lg,
            borderRadius: 16,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 1,
            minHeight: 140,
            ...shadows.small,
        },
        categoryIconContainer: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: theme.colors.surfaceVariant,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.md,
        },
        categoryName: {
            ...typography.body,
            textAlign: 'center',
            fontWeight: '500',
            fontSize: 14,
            paddingHorizontal: spacing.xs,
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
            borderRadius: 16,
            maxHeight: '80%',
            maxWidth: 400,
            alignSelf: 'center',
            backgroundColor: theme.colors.surface,
        },
        datePickerHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.md,
        },
        datePickerTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
            color: theme.colors.onSurface,
        },
        calendarStyle: {
            paddingTop: spacing.sm,
            paddingBottom: spacing.lg,
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