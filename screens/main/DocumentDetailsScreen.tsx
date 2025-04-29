import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, Alert } from 'react-native';
import { Text, useTheme, IconButton, Card, Divider } from 'react-native-paper';
import { spacing, typography } from '../../theme/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDocuments } from '../../contexts/DocumentContext';
import { Document } from '../../types/document';
import { Timestamp } from 'firebase/firestore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DocumentDetailsScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { documentId } = route.params as { documentId: string };
    const { documents, deleteDocument } = useDocuments();
    const [document, setDocument] = useState<Document | null>(null);

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

    const handleDelete = () => {
        Alert.alert(
            'Delete Document',
            'Are you sure you want to delete this document? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDocument(documentId);
                            // Navigate back to the previous screen
                            if (navigation.canGoBack()) {
                                navigation.goBack();
                            } else {
                                // If we can't go back, navigate to the home screen
                                navigation.navigate('Home');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete document. Please try again.');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
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
            backgroundColor: theme.colors.surface,
            elevation: 2,
        },
        backButton: {
            marginRight: spacing.sm,
        },
        deleteButton: {
            marginLeft: 'auto',
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
    });

    if (!document) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <IconButton
                        icon="arrow-left"
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
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
            return date.toLocaleDateString();
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                />
                <Text style={styles.title} numberOfLines={1}>{document.name}</Text>
                <IconButton
                    icon="delete"
                    onPress={handleDelete}
                    style={styles.deleteButton}
                    iconColor={theme.colors.error}
                />
            </View>
            <ScrollView style={styles.content}>
                <View style={styles.imageContainer}>
                    {document.fileData ? (
                        <Image
                            source={{
                                uri: `data:${document.fileType};base64,${document.fileData.replace(/^data:.+;base64,/, '')}`
                            }}
                            style={styles.image}
                            onError={(e) => console.error('Image loading error:', e.nativeEvent.error)}
                        />
                    ) : (
                        <MaterialCommunityIcons
                            name="file-document"
                            size={80}
                            style={styles.documentIcon}
                        />
                    )}
                </View>

                <Card style={styles.mainCard}>
                    <Card.Content style={styles.mainContent}>
                        <Text style={styles.documentName}>{document.name}</Text>
                        {document.description && (
                            <Text style={styles.documentDescription}>
                                {document.description}
                            </Text>
                        )}
                        {document.expiryDate && (
                            <View style={styles.expiryDateContainer}>
                                <MaterialCommunityIcons
                                    name="calendar-clock"
                                    size={24}
                                    style={styles.expiryDateIcon}
                                />
                                <Text style={styles.expiryDateText}>
                                    Expires on {formatDate(document.expiryDate)}
                                </Text>
                            </View>
                        )}
                    </Card.Content>
                </Card>
            </ScrollView>
        </View>
    );
};

export default DocumentDetailsScreen; 