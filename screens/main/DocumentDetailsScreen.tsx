import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, Alert, TouchableOpacity, StatusBar, ActivityIndicator, Share, Platform, Keyboard } from 'react-native';
import { Text, useTheme, IconButton, Card, TextInput, Portal, Modal } from 'react-native-paper';
import { spacing, typography } from '../../theme/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDocuments } from '../../contexts/DocumentContext';
import { Document } from '../../types/document';
import { Timestamp } from 'firebase/firestore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import CalendarPicker from 'react-native-calendar-picker';
import CustomAlert from '../../components/CustomAlert';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const DocumentDetailsScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { documentId } = route.params as { documentId: string };
    const { documents, deleteDocument, updateDocument } = useDocuments();
    const [document, setDocument] = useState<Document | null>(null);
    const [editingField, setEditingField] = useState<'name' | 'description' | 'expiryDate' | null>(null);
    const [tempValue, setTempValue] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{
        title: string;
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        onConfirm?: () => void;
    }>({
        title: '',
        message: '',
        type: 'info',
    });

    useEffect(() => {
        const doc = documents.find(d => d.id === documentId);
        setDocument(doc || null);
        if (doc) {
            console.log('DocumentDetailsScreen: Document data:', {
                id: doc.id,
                name: doc.name,
                fileType: doc.fileType,
                hasFileData: !!doc.fileData,
                fileDataLength: doc.fileData?.length
            });
        }
    }, [documentId, documents]);

    const showAlert = (
        title: string,
        message: string,
        type: 'success' | 'error' | 'warning' | 'info' = 'info',
        onConfirm?: () => void
    ) => {
        setAlertConfig({ title, message, type, onConfirm });
        setAlertVisible(true);
    };

    const handleDelete = () => {
        showAlert(
            'Delete Document',
            'Are you sure you want to delete this document? This action cannot be undone.',
            'warning',
            async () => {
                try {
                    await deleteDocument(documentId);
                    navigation.goBack();
                } catch (error) {
                    showAlert(
                        'Error',
                        'Failed to delete document. Please try again.',
                        'error'
                    );
                }
            }
        );
    };

    const handleUpdate = async (field: 'name' | 'description' | 'expiryDate', value: string | Date | null) => {
        if (!document) return;

        try {
            setIsUpdating(true);
            const updatedDocument = {
                ...document,
                [field]: value instanceof Date ? Timestamp.fromDate(value) : value
            };

            // Optimistically update local state
            setDocument(updatedDocument);

            // Update in the backend
            await updateDocument(documentId, updatedDocument);

            setEditingField(null);
            setTempValue('');
        } catch (error) {
            // Revert optimistic update on error
            const doc = documents.find(d => d.id === documentId);
            setDocument(doc || null);
            showAlert(
                'Error',
                'Failed to update document. Please try again.',
                'error'
            );
        } finally {
            setIsUpdating(false);
        }
    };

    const handleImageUpdate = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                // Check file size (2MB limit)
                const base64Size = result.assets[0].base64!.length * 0.75; // Approximate size in bytes
                const MAX_SIZE = 2 * 1024 * 1024; // 2MB in bytes

                if (base64Size > MAX_SIZE) {
                    showAlert(
                        'File Too Large',
                        'The selected file is too large. Please choose a file smaller than 2MB.',
                        'warning'
                    );
                    return;
                }

                setIsUpdating(true);
                try {
                    await updateDocument(documentId, {
                        ...document!,
                        fileData: `data:image/jpeg;base64,${result.assets[0].base64}`,
                        fileType: 'image/jpeg'
                    });
                } catch (error) {
                    showAlert(
                        'Error',
                        'Failed to update file. Please try again.',
                        'error'
                    );
                } finally {
                    setIsUpdating(false);
                }
            }
        } catch (error) {
            showAlert(
                'Error',
                'Failed to pick file. Please try again.',
                'error'
            );
        }
    };

    const handleShare = async () => {
        if (!document) return;

        try {
            const documentDetails = `Document Details:\n\nName: ${document.name}\nDescription: ${document.description || 'No description'}\nExpiry Date: ${document.expiryDate ? formatDate(document.expiryDate) : 'Not set'}`;

            if (document.fileData && document.fileType.startsWith('image/')) {
                // Create a temporary file for the image
                const base64Data = document.fileData.startsWith('data:')
                    ? document.fileData.split(',')[1]
                    : document.fileData;

                const filename = `${document.name.replace(/\s+/g, '_')}.${document.fileType.split('/')[1]}`;
                const filepath = `${FileSystem.cacheDirectory}${filename}`;

                // Write the base64 data to a file
                await FileSystem.writeAsStringAsync(filepath, base64Data, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                // Share the image
                await Sharing.shareAsync(filepath, {
                    mimeType: document.fileType,
                    dialogTitle: `Share ${document.name}`,
                    UTI: document.fileType,
                });

                // Share the details separately
                await Share.share({
                    title: document.name,
                    message: documentDetails,
                });

                // Clean up the temporary file after sharing
                setTimeout(async () => {
                    try {
                        await FileSystem.deleteAsync(filepath);
                    } catch (error) {
                        console.error('Error deleting temporary file:', error);
                    }
                }, 1000);
            } else {
                // For non-image files or when there's no file
                const shareContent = {
                    title: document.name,
                    message: documentDetails,
                };
                await Share.share(shareContent);
            }
        } catch (error) {
            console.error('Error sharing document:', error);
            showAlert(
                'Error',
                'Failed to share document. Please try again.',
                'error'
            );
        }
    };

    const handleDownload = async () => {
        if (!document?.fileData) return;

        try {
            const base64Data = document.fileData.startsWith('data:')
                ? document.fileData.split(',')[1]
                : document.fileData;

            const filename = `${document.name.replace(/\s+/g, '_')}.${document.fileType.split('/')[1]}`;
            const filepath = `${FileSystem.documentDirectory}${filename}`;

            // Write the base64 data to a file
            await FileSystem.writeAsStringAsync(filepath, base64Data, {
                encoding: FileSystem.EncodingType.Base64,
            });

            showAlert(
                'Success',
                `Image downloaded successfully to ${filepath}`,
                'success'
            );
        } catch (error) {
            console.error('Error downloading image:', error);
            showAlert(
                'Error',
                'Failed to download image. Please try again.',
                'error'
            );
        }
    };

    const screenWidth = Dimensions.get('window').width;
    const imageHeight = screenWidth * 0.7;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.md,
            paddingTop: (StatusBar.currentHeight || 0) + spacing.md,
            backgroundColor: theme.colors.surface,
            elevation: 2,
        },
        headerButtons: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
        },
        headerButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.surfaceVariant,
            justifyContent: 'center',
            alignItems: 'center',
            margin: 0,
        },
        deleteButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.errorContainer,
            justifyContent: 'center',
            alignItems: 'center',
            margin: 0,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold' as const,
            color: theme.colors.onBackground,
            flex: 1,
        },
        content: {
            flex: 1,
            padding: spacing.lg,
        },
        imageContainer: {
            width: '100%',
            height: imageHeight,
            backgroundColor: theme.colors.surfaceVariant,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.lg,
            borderRadius: spacing.md,
            overflow: 'hidden',
        },
        image: {
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
        },
        documentIcon: {
            fontSize: 80,
            color: theme.colors.primary,
        },
        mainCard: {
            marginBottom: spacing.lg,
            borderRadius: spacing.md,
        },
        mainContent: {
            padding: spacing.lg,
        },
        documentName: {
            fontSize: 24,
            fontWeight: 'bold' as const,
            color: theme.colors.onBackground,
            marginBottom: spacing.sm,
        },
        documentDescription: {
            fontSize: 16,
            color: theme.colors.onSurfaceVariant,
            marginBottom: spacing.md,
        },
        expiryDateContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceVariant,
            padding: spacing.md,
            borderRadius: spacing.sm,
            marginTop: spacing.md,
        },
        expiryDateIcon: {
            marginRight: spacing.sm,
            color: theme.colors.primary,
        },
        expiryDateText: {
            fontSize: 16,
            color: theme.colors.onSurfaceVariant,
        },
        editableField: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: spacing.sm,
            borderRadius: spacing.sm,
            backgroundColor: theme.colors.surfaceVariant,
            marginBottom: spacing.sm,
        },
        editIcon: {
            marginLeft: spacing.sm,
        },
        datePickerModal: {
            margin: spacing.lg,
            padding: spacing.lg,
            borderRadius: 16,
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
        loadingOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1,
        },
        loadingText: {
            color: theme.colors.onPrimary,
            marginTop: spacing.sm,
            ...typography.body,
        },
        previewImage: {
            width: '100%',
            height: 200,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 8,
        },
        fileIconContainer: {
            width: '100%',
            height: 200,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
        },
        fileTypeText: {
            marginTop: spacing.sm,
            color: theme.colors.onSurfaceVariant,
            fontSize: 14,
        },
        shareButton: {
            marginRight: spacing.xs,
        },
        creationDateContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceVariant,
            padding: spacing.md,
            borderRadius: spacing.sm,
            marginTop: spacing.md,
        },
        creationDateIcon: {
            marginRight: spacing.sm,
            color: theme.colors.primary,
        },
        creationDateText: {
            fontSize: 16,
            color: theme.colors.onSurfaceVariant,
        },
    });

    // Add keyboard listeners
    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                if (editingField && (editingField === 'name' || editingField === 'description') &&
                    tempValue !== (document?.[editingField] || '')) {
                    handleUpdate(editingField, tempValue);
                }
            }
        );

        return () => {
            keyboardDidHideListener.remove();
        };
    }, [editingField, tempValue, document]);

    // Handle text changes for name and description
    const handleTextChange = (field: 'name' | 'description', text: string) => {
        setTempValue(text);
    };

    // Handle expiry date change
    const handleExpiryDateChange = (date: Date) => {
        if (!date) return;
        handleUpdate('expiryDate', date);
        setShowDatePicker(false);
    };

    if (!document) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <IconButton
                        icon="arrow-left"
                        onPress={() => navigation.goBack()}
                        style={styles.headerButton}
                        iconColor={theme.colors.onSurface}
                    />
                    <Text style={styles.title}>Document Not Found</Text>
                </View>
            </View>
        );
    }

    const formatDate = (timestamp: Timestamp | undefined) => {
        if (!timestamp) return 'Not set';
        try {
            const date = timestamp.toDate();
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    };

    // Add a helper function to safely convert Timestamp to Date
    const getDateFromTimestamp = (timestamp: Timestamp | undefined): Date | undefined => {
        if (!timestamp) return undefined;
        try {
            return timestamp.toDate();
        } catch (error) {
            console.error('Error converting timestamp to date:', error);
            return undefined;
        }
    };

    const renderFilePreview = () => {
        if (!document?.fileData) return null;

        // Make sure the base64 data has the correct prefix
        const base64Data = document.fileData.startsWith('data:')
            ? document.fileData
            : `data:${document.fileType};base64,${document.fileData}`;

        if (document.fileType.startsWith('image/')) {
            return (
                <Image
                    source={{ uri: base64Data }}
                    style={styles.previewImage}
                    resizeMode="contain"
                />
            );
        }

        // For document files, show appropriate icons
        return (
            <View style={styles.fileIconContainer}>
                <MaterialCommunityIcons
                    name={getFileIcon(document.fileType)}
                    size={64}
                    color={theme.colors.primary}
                />
                <Text style={styles.fileTypeText}>
                    {getFileTypeDisplay(document.fileType)}
                </Text>
            </View>
        );
    };

    const getFileIcon = (fileType: string): keyof typeof MaterialCommunityIcons.glyphMap => {
        if (fileType.startsWith('image/')) return 'file-image';
        if (fileType.startsWith('application/pdf')) return 'file-pdf-box';
        if (fileType.startsWith('application/msword') || fileType.includes('wordprocessingml')) return 'file-word-box';
        if (fileType.startsWith('application/vnd.ms-excel') || fileType.includes('spreadsheetml')) return 'file-excel-box';
        return 'file-document-outline';
    };

    const getFileTypeDisplay = (fileType: string): string => {
        if (fileType.startsWith('image/')) return 'Image';
        if (fileType.startsWith('application/pdf')) return 'PDF Document';
        if (fileType.startsWith('application/msword') || fileType.includes('wordprocessingml')) return 'Word Document';
        if (fileType.startsWith('application/vnd.ms-excel') || fileType.includes('spreadsheetml')) return 'Excel Spreadsheet';
        return 'Document';
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    onPress={() => navigation.goBack()}
                    style={[styles.headerButton, { backgroundColor: 'transparent' }]}
                    iconColor={theme.colors.onSurface}
                />
                <Text style={styles.title} numberOfLines={1}>{document.name}</Text>
                <View style={styles.headerButtons}>
                    {document.fileData && document.fileType.startsWith('image/') && (
                        <IconButton
                            icon="download"
                            onPress={handleDownload}
                            style={styles.headerButton}
                            iconColor={theme.colors.primary}
                            size={24}
                        />
                    )}
                    <IconButton
                        icon="share-variant"
                        onPress={handleShare}
                        style={styles.headerButton}
                        iconColor={theme.colors.primary}
                        size={24}
                    />
                    <IconButton
                        icon="delete"
                        onPress={handleDelete}
                        style={styles.deleteButton}
                        iconColor={theme.colors.error}
                        size={24}
                    />
                </View>
            </View>
            <ScrollView style={styles.content}>
                <TouchableOpacity
                    style={styles.imageContainer}
                    onPress={handleImageUpdate}
                    disabled={isUpdating}
                >
                    {isUpdating ? (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                            <Text style={styles.loadingText}>Updating image...</Text>
                        </View>
                    ) : null}
                    {renderFilePreview()}
                </TouchableOpacity>

                <Card style={styles.mainCard}>
                    <Card.Content style={styles.mainContent}>
                        <TouchableOpacity
                            onPress={() => {
                                if (!isUpdating) {
                                    setEditingField('name');
                                    setTempValue(document?.name || '');
                                }
                            }}
                        >
                            {editingField === 'name' ? (
                                <TextInput
                                    value={tempValue}
                                    onChangeText={(text) => handleTextChange('name', text)}
                                    autoFocus
                                    style={styles.documentName}
                                    disabled={isUpdating}
                                />
                            ) : (
                                <Text style={styles.documentName}>{document?.name}</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                if (!isUpdating) {
                                    setEditingField('description');
                                    setTempValue(document?.description || '');
                                }
                            }}
                        >
                            {editingField === 'description' ? (
                                <TextInput
                                    value={tempValue}
                                    onChangeText={(text) => handleTextChange('description', text)}
                                    autoFocus
                                    multiline
                                    style={styles.documentDescription}
                                    disabled={isUpdating}
                                />
                            ) : (
                                <Text style={styles.documentDescription}>
                                    {document?.description || 'No description'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                if (!isUpdating) {
                                    setEditingField('expiryDate');
                                    setShowDatePicker(true);
                                }
                            }}
                        >
                            <View style={styles.expiryDateContainer}>
                                <MaterialCommunityIcons
                                    name="calendar-clock"
                                    size={24}
                                    style={styles.expiryDateIcon}
                                />
                                <Text style={styles.expiryDateText}>
                                    {document?.expiryDate ?
                                        `Expires on ${formatDate(document.expiryDate)}` :
                                        'Set expiry date'
                                    }
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.creationDateContainer}>
                            <MaterialCommunityIcons
                                name="calendar-plus"
                                size={24}
                                style={styles.creationDateIcon}
                            />
                            <Text style={styles.creationDateText}>
                                Added on {formatDate(document?.createdAt)}
                            </Text>
                        </View>
                    </Card.Content>
                </Card>
            </ScrollView>

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
                        minDate={new Date()}
                        maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 100))}
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
                        selectedStartDate={getDateFromTimestamp(document?.expiryDate)}
                        onDateChange={(date) => {
                            if (!date) return;

                            try {
                                // Check if date is a Moment object
                                const selectedDate = typeof date === 'object' && 'toDate' in date
                                    ? date.toDate()
                                    : new Date(date);

                                const now = new Date();

                                if (selectedDate < now) {
                                    Alert.alert('Invalid Date', 'Please select a future date');
                                    return;
                                }

                                handleExpiryDateChange(selectedDate);
                            } catch (error) {
                                console.error('Error processing date:', error);
                                Alert.alert('Error', 'Invalid date selection');
                            }
                        }}
                    />
                </Modal>
            </Portal>

            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onConfirm={() => {
                    setAlertVisible(false);
                    alertConfig.onConfirm?.();
                }}
                onCancel={() => setAlertVisible(false)}
            />
        </View>
    );
};

export default DocumentDetailsScreen; 