import React, { useState } from 'react';
import { View, StyleSheet, Platform, FlatList, Image, TouchableOpacity, Dimensions, StatusBar, ActivityIndicator, ScrollView } from 'react-native';
import { Text, useTheme, IconButton, Card, FAB, Portal, Modal, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { spacing, typography } from '../../theme/theme';
import { useDocuments } from '../../contexts/DocumentContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Timestamp } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import CustomAlert from '../../components/CustomAlert';

interface Document {
    id: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    categoryId: string;
    fileData?: string;
    fileType?: string;
    name?: string;
    expiryDate?: Timestamp;
}

type RootStackParamList = {
    DocumentDetails: { documentId: string };
    AddDocument: { categoryId: string };
};

const CategoryScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { documents, categories, deleteDocument, deleteCategory, updateDocument } = useDocuments();
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
    const [showAlert, setShowAlert] = useState(false);
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
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showMoveDialog, setShowMoveDialog] = useState(false);
    const [showMoveSelectedDialog, setShowMoveSelectedDialog] = useState(false);
    const [selectedTargetCategory, setSelectedTargetCategory] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processMessage, setProcessMessage] = useState('');
    const [isGridView, setIsGridView] = useState(true);
    const categoryId = (route.params as any)?.category;

    const category = categories.find(c => c.id === categoryId);
    const categoryName = category?.name || 'Category';
    const categoryDocuments = documents.filter(doc => doc.categoryId === categoryId);
    const numColumns = 2;
    const screenWidth = Dimensions.get('window').width;
    const itemWidth = (screenWidth - (spacing.lg * 2) - spacing.md) / numColumns;

    const isDefaultCategory = () => {
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
        return category && defaultCategoryNames.includes(category.name);
    };

    const handleDeleteCategory = () => {
        if (!category) return;

        setAlertConfig({
            title: 'Delete Category',
            message: `What would you like to do with the documents in "${categoryName}"?`,
            type: 'info',
            onConfirm: () => {
                setShowDeleteDialog(true);
            }
        });
        setShowAlert(true);
    };

    const handleDeleteConfirm = async (action: 'delete' | 'move') => {
        try {
            setIsProcessing(true);
            setProcessMessage(action === 'delete' ? 'Deleting documents...' : 'Preparing to move documents...');

            if (action === 'delete') {
                await deleteCategory(categoryId, 'delete');
                setAlertConfig({
                    title: 'Success',
                    message: 'Category and documents deleted successfully',
                    type: 'success'
                });
                setShowAlert(true);
                navigation.goBack();
            } else {
                setShowMoveDialog(true);
            }
        } catch (error) {
            setAlertConfig({
                title: 'Error',
                message: 'Failed to process category. Please try again.',
                type: 'error'
            });
            setShowAlert(true);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleMoveConfirm = async () => {
        if (!selectedTargetCategory) return;

        try {
            setIsProcessing(true);
            setProcessMessage('Moving documents...');
            await deleteCategory(categoryId, 'move', selectedTargetCategory);
            setAlertConfig({
                title: 'Success',
                message: 'Documents moved successfully',
                type: 'success'
            });
            setShowAlert(true);
            navigation.goBack();
        } catch (error) {
            setAlertConfig({
                title: 'Error',
                message: 'Failed to move documents. Please try again.',
                type: 'error'
            });
            setShowAlert(true);
        } finally {
            setIsProcessing(false);
            setShowMoveDialog(false);
        }
    };

    const handleMoveSelected = async () => {
        if (!selectedTargetCategory) return;

        try {
            setIsProcessing(true);
            setProcessMessage('Moving documents...');

            // Move each selected document to the new category
            for (const docId of selectedDocuments) {
                const document = documents.find(d => d.id === docId);
                if (document) {
                    await updateDocument(docId, { categoryId: selectedTargetCategory });
                }
            }

            setSelectedDocuments([]);
            setShowMoveSelectedDialog(false);
            setAlertConfig({
                title: 'Success',
                message: 'Documents moved successfully',
                type: 'success'
            });
            setShowAlert(true);
        } catch (error) {
            setAlertConfig({
                title: 'Error',
                message: 'Failed to move documents. Please try again.',
                type: 'error'
            });
            setShowAlert(true);
        } finally {
            setIsProcessing(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: (StatusBar.currentHeight || 0) + spacing.md,
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.md,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.colors.onBackground,
            marginLeft: spacing.md,
        },
        content: {
            flex: 1,
        },
        gridContainer: {
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.lg,
        },
        gridItem: {
            width: itemWidth,
            marginRight: spacing.md,
            marginBottom: spacing.md,
        },
        card: {
            borderRadius: 12,
            overflow: 'hidden',
            height: 280,
            backgroundColor: theme.colors.surface,
            elevation: 2,
        },
        imageContainer: {
            width: '100%',
            height: 160,
            backgroundColor: theme.colors.surfaceVariant,
            justifyContent: 'center',
            alignItems: 'center',
        },
        image: {
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
        },
        documentIcon: {
            fontSize: 40,
            color: theme.colors.primary,
        },
        cardContent: {
            padding: spacing.md,
            height: 120,
            justifyContent: 'space-between',
        },
        documentTitle: {
            fontSize: typography.body.fontSize,
            fontWeight: '500',
            color: theme.colors.onSurface,
            marginBottom: spacing.xs,
        },
        documentDescription: {
            fontSize: typography.caption.fontSize,
            color: theme.colors.onSurfaceVariant,
            marginBottom: spacing.xs,
            flex: 1,
        },
        expiryDate: {
            fontSize: typography.caption.fontSize,
            color: theme.colors.error,
        },
        expiredDate: {
            color: theme.colors.error,
            fontWeight: 'bold',
        },
        emptyMessage: {
            ...typography.body,
            color: theme.colors.onSurfaceVariant,
            textAlign: 'center',
            marginTop: spacing.xl,
        },
        fab: {
            position: 'absolute',
            right: spacing.lg,
            bottom: spacing.lg,
            borderRadius: 30,
        },
        selectedItem: {
            opacity: 0.8,
        },
        selectedCard: {
            borderWidth: 2,
            borderColor: theme.colors.primary,
        },
        selectionIndicator: {
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 12,
        },
        selectedCount: {
            marginLeft: 'auto',
            color: theme.colors.primary,
            fontWeight: 'bold',
        },
        actionBar: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            padding: spacing.md,
            backgroundColor: theme.colors.surface,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 4,
        },
        actionButton: {
            backgroundColor: theme.colors.surfaceVariant,
            marginHorizontal: spacing.sm,
        },
        loadingOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
        },
        loadingContainer: {
            backgroundColor: theme.colors.surface,
            padding: spacing.xl,
            borderRadius: 12,
            alignItems: 'center',
            width: '80%',
        },
        loadingMessage: {
            marginTop: spacing.md,
            color: theme.colors.onSurface,
            textAlign: 'center',
        },
        progressBar: {
            width: '100%',
            height: 8,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 4,
            marginTop: spacing.lg,
            overflow: 'hidden',
        },
        progressFill: {
            height: '100%',
            backgroundColor: theme.colors.primary,
            borderRadius: 4,
        },
        progressText: {
            marginTop: spacing.sm,
            color: theme.colors.onSurfaceVariant,
            fontSize: 14,
        },
        modal: {
            margin: 20,
            padding: 20,
            borderRadius: 12,
            maxHeight: '80%',
            width: '90%',
            alignSelf: 'center',
        },
        modalHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0, 0, 0, 0.1)',
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            marginLeft: 12,
            flex: 1,
        },
        modalSubtitle: {
            fontSize: 16,
            marginBottom: 24,
            lineHeight: 24,
        },
        modalContent: {
            gap: 12,
            marginBottom: 20,
        },
        optionCard: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderRadius: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.1)',
        },
        optionTextContainer: {
            flex: 1,
            marginLeft: 12,
            marginRight: 8,
        },
        optionTitle: {
            fontSize: 16,
            fontWeight: '500',
        },
        optionDescription: {
            fontSize: 14,
            marginTop: 4,
            lineHeight: 20,
        },
        modalFooter: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 24,
            gap: 8,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: 'rgba(0, 0, 0, 0.1)',
        },
        categoryList: {
            maxHeight: 300,
            marginVertical: 16,
            paddingRight: 8,
        },
        categoryItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderRadius: 8,
            marginBottom: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.1)',
        },
        selectedCategoryItem: {
            backgroundColor: 'rgba(0, 122, 255, 0.1)',
            borderColor: theme.colors.primary,
        },
        categoryIconContainer: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(0, 122, 255, 0.1)',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        categoryTextContainer: {
            flex: 1,
        },
        categoryItemText: {
            fontSize: 16,
            fontWeight: '500',
        },
        categoryItemCount: {
            fontSize: 14,
            marginTop: 4,
            color: 'rgba(0, 0, 0, 0.6)',
        },
        processingOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 12,
            zIndex: 1000,
        },
        processingContainer: {
            alignItems: 'center',
            padding: 24,
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            width: '80%',
        },
        processingText: {
            marginTop: 16,
            fontSize: 16,
            textAlign: 'center',
            lineHeight: 24,
        },
        processingSubtext: {
            marginTop: 8,
            fontSize: 14,
            textAlign: 'center',
            color: 'rgba(0, 0, 0, 0.6)',
            lineHeight: 20,
        },
        headerRight: {
            flexDirection: 'row',
            marginLeft: 'auto',
        },
        listContainer: {
            padding: spacing.lg,
        },
        listItem: {
            marginBottom: spacing.md,
            borderRadius: 12,
            backgroundColor: theme.colors.surface,
        },
        listItemContent: {
            flexDirection: 'row',
            padding: spacing.md,
        },
        listItemImageContainer: {
            width: 60,
            height: 60,
            borderRadius: 8,
            backgroundColor: theme.colors.surfaceVariant,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing.md,
        },
        listItemImage: {
            width: 60,
            height: 60,
            borderRadius: 8,
        },
        listItemTextContainer: {
            flex: 1,
        },
    });

    const formatDate = (timestamp: Timestamp | undefined) => {
        if (!timestamp) return null;
        try {
            const date = timestamp.toDate();
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return null;
        }
    };

    const handleLongPress = (documentId: string) => {
        if (selectedDocuments.includes(documentId)) {
            setSelectedDocuments(selectedDocuments.filter(id => id !== documentId));
        } else {
            setSelectedDocuments([...selectedDocuments, documentId]);
        }
    };

    const handlePress = (documentId: string) => {
        if (selectedDocuments.length > 0) {
            handleLongPress(documentId);
        } else {
            navigation.navigate('DocumentDetails', { documentId });
        }
    };

    const handleBulkDelete = async () => {
        setAlertConfig({
            title: 'Delete Documents',
            message: `Are you sure you want to delete ${selectedDocuments.length} document(s)?`,
            type: 'warning',
            onConfirm: async () => {
                try {
                    setIsLoading(true);
                    setLoadingMessage('Deleting documents...');
                    setLoadingProgress(0);

                    const total = selectedDocuments.length;
                    for (let i = 0; i < selectedDocuments.length; i++) {
                        await deleteDocument(selectedDocuments[i]);
                        setLoadingProgress((i + 1) / total);
                    }

                    setSelectedDocuments([]);
                    setAlertConfig({
                        title: 'Success',
                        message: 'Documents deleted successfully',
                        type: 'success'
                    });
                    setShowAlert(true);
                } catch (error) {
                    setAlertConfig({
                        title: 'Error',
                        message: 'Failed to delete documents',
                        type: 'error'
                    });
                    setShowAlert(true);
                } finally {
                    setIsLoading(false);
                }
            }
        });
        setShowAlert(true);
    };

    const handleBulkShare = async () => {
        try {
            setIsLoading(true);
            setLoadingMessage('Preparing documents for sharing...');
            setLoadingProgress(0);

            const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
            const total = selectedDocs.length;
            let completed = 0;

            // Create a temporary directory for the files
            const tempDir = `${FileSystem.cacheDirectory}temp_share_${Date.now()}/`;
            await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });

            // Save all files to the temporary directory
            for (const doc of selectedDocs) {
                if (doc.fileData) {
                    setLoadingMessage(`Preparing ${doc.name || 'document'} (${completed + 1}/${total})...`);

                    const base64Data = doc.fileData.startsWith('data:')
                        ? doc.fileData.split(',')[1]
                        : doc.fileData;

                    const ext = doc.fileType?.split('/')[1] || 'bin';
                    const safeName = (doc.name || 'file').replace(/\s+/g, '_');
                    const filename = `${safeName}.${ext}`;
                    const filepath = `${tempDir}${filename}`;

                    await FileSystem.writeAsStringAsync(filepath, base64Data, {
                        encoding: FileSystem.EncodingType.Base64,
                    });

                    completed++;
                    setLoadingProgress(completed / total);
                }
            }

            // Share the first file with a message indicating multiple files
            const files = await FileSystem.readDirectoryAsync(tempDir);
            if (files.length > 0) {
                const firstFile = `${tempDir}${files[0]}`;
                await Sharing.shareAsync(firstFile, {
                    mimeType: 'application/octet-stream',
                    dialogTitle: `Share ${files.length} document(s)`,
                    UTI: 'public.data',
                });
            }

            // Clean up
            await FileSystem.deleteAsync(tempDir, { idempotent: true });

            setSelectedDocuments([]);
            setAlertConfig({
                title: 'Success',
                message: 'Documents shared successfully',
                type: 'success',
            });
            setShowAlert(true);
        } catch (error) {
            console.error('Error in bulk share:', error);
            setAlertConfig({
                title: 'Error',
                message: 'Failed to share documents',
                type: 'error',
            });
            setShowAlert(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkDownload = async () => {
        try {
            setIsLoading(true);
            setLoadingMessage('Downloading documents...');
            setLoadingProgress(0);

            const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
            const total = selectedDocs.length;
            let completed = 0;

            const downloadPromises = selectedDocs.map(async (doc) => {
                if (doc.fileData) {
                    const base64Data = doc.fileData.startsWith('data:')
                        ? doc.fileData.split(',')[1]
                        : doc.fileData;

                    const filename = `${doc.name?.replace(/\s+/g, '_')}.${doc.fileType?.split('/')[1]}`;
                    const filepath = `${FileSystem.documentDirectory}${filename}`;

                    await FileSystem.writeAsStringAsync(filepath, base64Data, {
                        encoding: FileSystem.EncodingType.Base64,
                    });

                    completed++;
                    setLoadingProgress(completed / total);
                }
            });

            await Promise.all(downloadPromises);
            setSelectedDocuments([]);
            setAlertConfig({
                title: 'Success',
                message: 'Documents downloaded successfully',
                type: 'success'
            });
            setShowAlert(true);
        } catch (error) {
            setAlertConfig({
                title: 'Error',
                message: 'Failed to download documents',
                type: 'error'
            });
            setShowAlert(true);
        } finally {
            setIsLoading(false);
        }
    };

    const renderDocumentItem = ({ item }: { item: Document }) => {
        const isSelected = selectedDocuments.includes(item.id);

        if (!isGridView) {
            return (
                <TouchableOpacity
                    style={[styles.listItem, isSelected && styles.selectedItem]}
                    onPress={() => handlePress(item.id)}
                    onLongPress={() => handleLongPress(item.id)}
                >
                    <View style={styles.listItemContent}>
                        <View style={styles.listItemImageContainer}>
                            {item.fileData ? (
                                <Image
                                    source={{
                                        uri: `data:${item.fileType};base64,${item.fileData.replace(/^data:.+;base64,/, '')}`
                                    }}
                                    style={styles.listItemImage}
                                    onError={(e) => console.error('Image loading error:', e.nativeEvent.error)}
                                />
                            ) : (
                                <MaterialCommunityIcons
                                    name="file-document"
                                    size={40}
                                    style={styles.documentIcon}
                                />
                            )}
                            {isSelected && (
                                <View style={styles.selectionIndicator}>
                                    <MaterialCommunityIcons
                                        name="check-circle"
                                        size={24}
                                        color={theme.colors.primary}
                                    />
                                </View>
                            )}
                        </View>
                        <View style={styles.listItemTextContainer}>
                            <Text style={styles.documentTitle} numberOfLines={1}>
                                {item.name || item.title}
                            </Text>
                            {item.description && (
                                <Text style={styles.documentDescription} numberOfLines={2}>
                                    {item.description}
                                </Text>
                            )}
                            {item.expiryDate && (
                                <Text style={[
                                    styles.expiryDate,
                                    new Date(item.expiryDate.toDate()) < new Date() && styles.expiredDate
                                ]} numberOfLines={1}>
                                    Expires: {formatDate(item.expiryDate)}
                                </Text>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={[styles.gridItem, isSelected && styles.selectedItem]}
                onPress={() => handlePress(item.id)}
                onLongPress={() => handleLongPress(item.id)}
            >
                <Card style={[styles.card, isSelected && styles.selectedCard]}>
                    <View style={styles.imageContainer}>
                        {item.fileData ? (
                            <Image
                                source={{
                                    uri: `data:${item.fileType};base64,${item.fileData.replace(/^data:.+;base64,/, '')}`
                                }}
                                style={styles.image}
                                onError={(e) => console.error('Image loading error:', e.nativeEvent.error)}
                            />
                        ) : (
                            <MaterialCommunityIcons
                                name="file-document"
                                size={40}
                                style={styles.documentIcon}
                            />
                        )}
                        {isSelected && (
                            <View style={styles.selectionIndicator}>
                                <MaterialCommunityIcons
                                    name="check-circle"
                                    size={24}
                                    color={theme.colors.primary}
                                />
                            </View>
                        )}
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.documentTitle} numberOfLines={1}>
                            {item.name || item.title}
                        </Text>
                        {item.description && (
                            <Text style={styles.documentDescription} numberOfLines={2}>
                                {item.description}
                            </Text>
                        )}
                        {item.expiryDate && (
                            <Text style={[
                                styles.expiryDate,
                                new Date(item.expiryDate.toDate()) < new Date() && styles.expiredDate
                            ]} numberOfLines={1}>
                                Expires: {formatDate(item.expiryDate)}
                            </Text>
                        )}
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={() => {
                        if (selectedDocuments.length > 0) {
                            setSelectedDocuments([]);
                        } else {
                            navigation.goBack();
                        }
                    }}
                />
                <Text style={styles.title}>{categoryName}</Text>
                <View style={styles.headerRight}>
                    {!isDefaultCategory() && (
                        <IconButton
                            icon="delete"
                            size={24}
                            onPress={handleDeleteCategory}
                        />
                    )}
                    <IconButton
                        icon={isGridView ? 'view-grid' : 'format-list-bulleted'}
                        size={24}
                        onPress={() => setIsGridView(!isGridView)}
                        iconColor="#007AFF"
                    />
                </View>
                {selectedDocuments.length > 0 && (
                    <Text style={styles.selectedCount}>
                        {selectedDocuments.length} selected
                    </Text>
                )}
            </View>
            {categoryDocuments.length > 0 ? (
                <FlatList
                    key={isGridView ? 'grid' : 'list'}
                    data={categoryDocuments}
                    keyExtractor={item => item.id}
                    numColumns={isGridView ? numColumns : 1}
                    contentContainerStyle={isGridView ? styles.gridContainer : styles.listContainer}
                    renderItem={renderDocumentItem}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={isGridView ? { justifyContent: 'space-between' } : undefined}
                />
            ) : (
                <View style={styles.content}>
                    <Text style={styles.emptyMessage}>
                        No documents found in this category
                    </Text>
                </View>
            )}
            {selectedDocuments.length > 0 ? (
                <View style={styles.actionBar}>
                    <IconButton
                        icon="delete"
                        size={24}
                        onPress={handleBulkDelete}
                        style={styles.actionButton}
                    />
                    <IconButton
                        icon="share-variant"
                        size={24}
                        onPress={handleBulkShare}
                        style={styles.actionButton}
                    />
                    <IconButton
                        icon="download"
                        size={24}
                        onPress={handleBulkDownload}
                        style={styles.actionButton}
                    />
                    <IconButton
                        icon="folder-move"
                        size={24}
                        onPress={() => setShowMoveSelectedDialog(true)}
                        style={styles.actionButton}
                    />
                </View>
            ) : (
                <FAB
                    icon="plus"
                    style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                    onPress={() => navigation.navigate('AddDocument', { categoryId })}
                    color="#FFFFFF"
                />
            )}
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.loadingMessage}>{loadingMessage}</Text>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${loadingProgress * 100}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {Math.round(loadingProgress * 100)}%
                        </Text>
                    </View>
                </View>
            )}
            <Portal>
                <Modal
                    visible={showDeleteDialog}
                    onDismiss={() => !isProcessing && setShowDeleteDialog(false)}
                    contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
                >
                    <View style={styles.modalHeader}>
                        <MaterialCommunityIcons
                            name="alert-circle-outline"
                            size={32}
                            color={theme.colors.primary}
                        />
                        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                            Handle Documents
                        </Text>
                    </View>
                    <Text style={[styles.modalSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                        Choose what to do with the documents in "{categoryName}"
                    </Text>
                    <View style={styles.modalContent}>
                        <View style={styles.optionCard}>
                            <MaterialCommunityIcons
                                name="delete"
                                size={24}
                                color={theme.colors.error}
                            />
                            <View style={styles.optionTextContainer}>
                                <Text style={[styles.optionTitle, { color: theme.colors.onSurface }]}>
                                    Delete All Documents
                                </Text>
                                <Text style={[styles.optionDescription, { color: theme.colors.onSurfaceVariant }]}>
                                    Permanently remove all documents in this category
                                </Text>
                            </View>
                            <IconButton
                                icon="chevron-right"
                                size={24}
                                onPress={() => handleDeleteConfirm('delete')}
                                disabled={isProcessing}
                            />
                        </View>
                        <View style={styles.optionCard}>
                            <MaterialCommunityIcons
                                name="folder-move"
                                size={24}
                                color={theme.colors.primary}
                            />
                            <View style={styles.optionTextContainer}>
                                <Text style={[styles.optionTitle, { color: theme.colors.onSurface }]}>
                                    Move to Another Category
                                </Text>
                                <Text style={[styles.optionDescription, { color: theme.colors.onSurfaceVariant }]}>
                                    Transfer all documents to a different category
                                </Text>
                            </View>
                            <IconButton
                                icon="chevron-right"
                                size={24}
                                onPress={() => handleDeleteConfirm('move')}
                                disabled={isProcessing}
                            />
                        </View>
                    </View>
                    <View style={styles.modalFooter}>
                        <Button
                            mode="text"
                            onPress={() => setShowDeleteDialog(false)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                    </View>
                    {isProcessing && (
                        <View style={styles.processingOverlay}>
                            <View style={styles.processingContainer}>
                                <ActivityIndicator size="large" color={theme.colors.primary} />
                                <Text style={[styles.processingText, { color: theme.colors.onSurface }]}>
                                    {processMessage}
                                </Text>
                                <Text style={[styles.processingSubtext, { color: theme.colors.onSurfaceVariant }]}>
                                    Please wait while we process your request...
                                </Text>
                            </View>
                        </View>
                    )}
                </Modal>

                <Modal
                    visible={showMoveDialog}
                    onDismiss={() => !isProcessing && setShowMoveDialog(false)}
                    contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
                >
                    <View style={styles.modalHeader}>
                        <MaterialCommunityIcons
                            name="folder-move"
                            size={32}
                            color={theme.colors.primary}
                        />
                        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                            Select Target Category
                        </Text>
                    </View>
                    <Text style={[styles.modalSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                        Choose where to move the documents from "{categoryName}"
                    </Text>
                    <ScrollView style={styles.categoryList}>
                        {categories
                            .filter(c => c.id !== categoryId && !isDefaultCategory())
                            .map(c => (
                                <TouchableOpacity
                                    key={c.id}
                                    style={[
                                        styles.categoryItem,
                                        selectedTargetCategory === c.id && styles.selectedCategoryItem
                                    ]}
                                    onPress={() => !isProcessing && setSelectedTargetCategory(c.id)}
                                    disabled={isProcessing}
                                >
                                    <View style={styles.categoryIconContainer}>
                                        <MaterialCommunityIcons
                                            name={c.icon}
                                            size={24}
                                            color={theme.colors.primary}
                                        />
                                    </View>
                                    <View style={styles.categoryTextContainer}>
                                        <Text style={[styles.categoryItemText, { color: theme.colors.onSurface }]}>
                                            {c.name}
                                        </Text>
                                        <Text style={[styles.categoryItemCount, { color: theme.colors.onSurfaceVariant }]}>
                                            {documents.filter(d => d.categoryId === c.id).length} documents
                                        </Text>
                                    </View>
                                    {selectedTargetCategory === c.id && (
                                        <MaterialCommunityIcons
                                            name="check-circle"
                                            size={24}
                                            color={theme.colors.primary}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                    </ScrollView>
                    <View style={styles.modalFooter}>
                        <Button
                            mode="text"
                            onPress={() => setShowMoveDialog(false)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleMoveConfirm}
                            disabled={!selectedTargetCategory || isProcessing}
                            loading={isProcessing}
                        >
                            Move Documents
                        </Button>
                    </View>
                    {isProcessing && (
                        <View style={styles.processingOverlay}>
                            <View style={styles.processingContainer}>
                                <ActivityIndicator size="large" color={theme.colors.primary} />
                                <Text style={[styles.processingText, { color: theme.colors.onSurface }]}>
                                    {processMessage}
                                </Text>
                                <Text style={[styles.processingSubtext, { color: theme.colors.onSurfaceVariant }]}>
                                    Please wait while we move your documents...
                                </Text>
                            </View>
                        </View>
                    )}
                </Modal>

                <Modal
                    visible={showMoveSelectedDialog}
                    onDismiss={() => !isProcessing && setShowMoveSelectedDialog(false)}
                    contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
                >
                    <View style={styles.modalHeader}>
                        <MaterialCommunityIcons
                            name="folder-move"
                            size={32}
                            color={theme.colors.primary}
                        />
                        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                            Move Selected Documents
                        </Text>
                    </View>
                    <Text style={[styles.modalSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                        Choose where to move {selectedDocuments.length} document(s)
                    </Text>
                    <ScrollView style={styles.categoryList}>
                        {categories
                            .filter(c => c.id !== categoryId)
                            .map(c => (
                                <TouchableOpacity
                                    key={c.id}
                                    style={[
                                        styles.categoryItem,
                                        selectedTargetCategory === c.id && styles.selectedCategoryItem
                                    ]}
                                    onPress={() => !isProcessing && setSelectedTargetCategory(c.id)}
                                    disabled={isProcessing}
                                >
                                    <View style={styles.categoryIconContainer}>
                                        <MaterialCommunityIcons
                                            name={c.icon}
                                            size={24}
                                            color={theme.colors.primary}
                                        />
                                    </View>
                                    <View style={styles.categoryTextContainer}>
                                        <Text style={[styles.categoryItemText, { color: theme.colors.onSurface }]}>
                                            {c.name}
                                        </Text>
                                        <Text style={[styles.categoryItemCount, { color: theme.colors.onSurfaceVariant }]}>
                                            {documents.filter(d => d.categoryId === c.id).length} documents
                                        </Text>
                                    </View>
                                    {selectedTargetCategory === c.id && (
                                        <MaterialCommunityIcons
                                            name="check-circle"
                                            size={24}
                                            color={theme.colors.primary}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                    </ScrollView>
                    <View style={styles.modalFooter}>
                        <Button
                            mode="text"
                            onPress={() => setShowMoveSelectedDialog(false)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleMoveSelected}
                            disabled={!selectedTargetCategory || isProcessing}
                            loading={isProcessing}
                        >
                            Move Documents
                        </Button>
                    </View>
                    {isProcessing && (
                        <View style={styles.processingOverlay}>
                            <View style={styles.processingContainer}>
                                <ActivityIndicator size="large" color={theme.colors.primary} />
                                <Text style={[styles.processingText, { color: theme.colors.onSurface }]}>
                                    {processMessage}
                                </Text>
                                <Text style={[styles.processingSubtext, { color: theme.colors.onSurfaceVariant }]}>
                                    Please wait while we move your documents...
                                </Text>
                            </View>
                        </View>
                    )}
                </Modal>
            </Portal>
            <CustomAlert
                visible={showAlert}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onConfirm={() => {
                    setShowAlert(false);
                    alertConfig.onConfirm?.();
                }}
                onCancel={() => setShowAlert(false)}
            />
        </View>
    );
};

export default CategoryScreen; 