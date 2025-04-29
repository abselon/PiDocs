import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, Alert, TouchableOpacity, StatusBar } from 'react-native';
import { Text, useTheme, IconButton, Card, TextInput, Portal, Modal } from 'react-native-paper';
import { spacing, typography } from '../../theme/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDocuments } from '../../contexts/DocumentContext';
import { Document } from '../../types/document';
import { Timestamp } from 'firebase/firestore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import CalendarPicker from 'react-native-calendar-picker';

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
    const [tempDate, setTempDate] = useState<Date | null>(null);

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
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete document. Please try again.');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleUpdate = async (field: 'name' | 'description' | 'expiryDate', value: string | Date | null) => {
        if (!document) return;

        try {
            await updateDocument(documentId, {
                ...document,
                [field]: value instanceof Date ? Timestamp.fromDate(value) : value
            });
            setEditingField(null);
            setTempValue('');
        } catch (error) {
            Alert.alert('Error', 'Failed to update document. Please try again.');
        }
    };

    const handleImageUpdate = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
                base64: true,
            });

            if (!result.canceled && result.assets[0].base64) {
                await updateDocument(documentId, {
                    ...document!,
                    fileData: `data:image/jpeg;base64,${result.assets[0].base64}`,
                    fileType: 'image/jpeg'
                });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update image. Please try again.');
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
                <TouchableOpacity
                    style={styles.imageContainer}
                    onPress={handleImageUpdate}
                >
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
                </TouchableOpacity>

                <Card style={styles.mainCard}>
                    <Card.Content style={styles.mainContent}>
                        <TouchableOpacity
                            onPress={() => {
                                setEditingField('name');
                                setTempValue(document.name);
                            }}
                        >
                            {editingField === 'name' ? (
                                <TextInput
                                    value={tempValue}
                                    onChangeText={setTempValue}
                                    onBlur={() => handleUpdate('name', tempValue)}
                                    autoFocus
                                    style={styles.documentName}
                                />
                            ) : (
                                <Text style={styles.documentName}>{document.name}</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setEditingField('description');
                                setTempValue(document.description || '');
                            }}
                        >
                            {editingField === 'description' ? (
                                <TextInput
                                    value={tempValue}
                                    onChangeText={setTempValue}
                                    onBlur={() => handleUpdate('description', tempValue)}
                                    autoFocus
                                    multiline
                                    style={styles.documentDescription}
                                />
                            ) : (
                                <Text style={styles.documentDescription}>
                                    {document.description || 'No description'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setEditingField('expiryDate');
                                setShowDatePicker(true);
                            }}
                        >
                            <View style={styles.expiryDateContainer}>
                                <MaterialCommunityIcons
                                    name="calendar-clock"
                                    size={24}
                                    style={styles.expiryDateIcon}
                                />
                                <Text style={styles.expiryDateText}>
                                    {document.expiryDate ?
                                        `Expires on ${formatDate(document.expiryDate)}` :
                                        'Set expiry date'
                                    }
                                </Text>
                            </View>
                        </TouchableOpacity>
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
                        selectedStartDate={document.expiryDate?.toDate()}
                        onDateChange={(date) => {
                            if (date) {
                                const selectedDate = date.toDate();
                                const now = new Date();

                                if (selectedDate < now) {
                                    Alert.alert('Invalid Date', 'Please select a future date');
                                    return;
                                }

                                handleUpdate('expiryDate', selectedDate);
                                setShowDatePicker(false);
                            }
                        }}
                    />
                </Modal>
            </Portal>
        </View>
    );
};

export default DocumentDetailsScreen; 