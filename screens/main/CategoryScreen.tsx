import React, { useState } from 'react';
import { View, StyleSheet, Platform, FlatList, Image, TouchableOpacity, Dimensions, StatusBar, ActivityIndicator } from 'react-native';
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
    DocumentDetail: { documentId: string };
    AddDocument: { categoryId: string };
};

const CategoryScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { documents, categories, deleteDocument } = useDocuments();
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
    const categoryId = (route.params as any)?.category;

    const category = categories.find(c => c.id === categoryId);
    const categoryName = category?.name || 'Category';
    const categoryDocuments = documents.filter(doc => doc.categoryId === categoryId);
    const numColumns = 2;
    const screenWidth = Dimensions.get('window').width;
    const itemWidth = (screenWidth - (spacing.lg * 2) - spacing.md) / numColumns;

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
            navigation.navigate('DocumentDetail', { documentId });
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
                {selectedDocuments.length > 0 && (
                    <Text style={styles.selectedCount}>
                        {selectedDocuments.length} selected
                    </Text>
                )}
            </View>
            {categoryDocuments.length > 0 ? (
                <FlatList
                    data={categoryDocuments}
                    keyExtractor={item => item.id}
                    numColumns={numColumns}
                    contentContainerStyle={styles.gridContainer}
                    renderItem={renderDocumentItem}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
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