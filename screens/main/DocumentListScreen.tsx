import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, useTheme, FAB, Searchbar, Portal, Modal, TextInput, Button } from 'react-native-paper';
import { spacing } from '../../theme/theme';
import { useDocuments } from '../../contexts/DocumentContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Category } from '../../types/document';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import CustomAlert from '../../components/CustomAlert';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DocumentListScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { documents, categories, addCategory } = useDocuments();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState<keyof typeof MaterialCommunityIcons.glyphMap>('folder');
    const [loading, setLoading] = useState(false);
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

    const showAlert = (
        title: string,
        message: string,
        type: 'success' | 'error' | 'warning' | 'info' = 'info',
        onConfirm?: () => void
    ) => {
        setAlertConfig({ title, message, type, onConfirm });
        setAlertVisible(true);
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            showAlert(
                'Invalid Category Name',
                'Please enter a valid category name.',
                'warning'
            );
            return;
        }

        try {
            setLoading(true);
            await addCategory({
                name: newCategoryName.trim(),
                icon: newCategoryIcon,
                userId: '', // Will be set by the context
                description: ''
            });
            setShowAddCategoryModal(false);
            setNewCategoryName('');
            showAlert(
                'Success',
                'Category created successfully!',
                'success'
            );
        } catch (err) {
            console.error('Error creating category:', err);
            showAlert(
                'Error',
                'Failed to create category. Please try again.',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

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

    const getDocumentCount = (categoryId: string) => {
        const filteredDocs = documents.filter(doc => {
            const matchesCategory = doc.categoryId === categoryId;
            const matchesSearch = searchQuery.toLowerCase().trim() === '' ||
                doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (doc.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (doc.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
        return filteredDocs.length;
    };

    const getCategoryIcon = (category: Category) => {
        switch (category.name.toLowerCase()) {
            case 'personal ids':
                return 'card-account-details';
            case 'financial':
                return 'bank';
            case 'medical':
                return 'medical-bag';
            case 'education':
                return 'school';
            case 'insurance':
                return 'shield-check';
            case 'legal':
                return 'gavel';
            default:
                return category.icon || 'folder';
        }
    };

    const renderCategoryCard = (category: Category) => {
        const documentCount = getDocumentCount(category.id);
        return (
            <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: '#1E1E1E' }]}
                onPress={() => navigation.navigate('Categories', { category: category.id })}
            >
                <View style={[styles.iconContainer, { backgroundColor: '#007AFF' }]}>
                    <MaterialCommunityIcons
                        name={getCategoryIcon(category)}
                        size={24}
                        color="#FFFFFF"
                    />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.documentCount}>
                    {documentCount} document{documentCount !== 1 ? 's' : ''}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#000000' }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Browse</Text>
                <Text style={styles.subtitle}>All your documents by category</Text>
                <Searchbar
                    placeholder="Search documents"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={styles.searchInput}
                    iconColor="#007AFF"
                    placeholderTextColor="#8E8E93"
                />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
            >
                {categories.map(renderCategoryCard)}
            </ScrollView>

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: '#007AFF' }]}
                onPress={() => setShowAddCategoryModal(true)}
            />

            <Portal>
                <Modal
                    visible={showAddCategoryModal}
                    onDismiss={() => setShowAddCategoryModal(false)}
                    contentContainerStyle={styles.modalContainer}
                >
                    <Text style={styles.modalTitle}>New Category</Text>
                    <TextInput
                        label="Category Name"
                        value={newCategoryName}
                        onChangeText={setNewCategoryName}
                        style={styles.modalInput}
                        mode="outlined"
                    />
                    <Text style={styles.modalSubtitle}>Choose Icon</Text>
                    <IconSelector />
                    <View style={styles.modalButtons}>
                        <Button
                            mode="outlined"
                            onPress={() => setShowAddCategoryModal(false)}
                            style={styles.modalButton}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleCreateCategory}
                            loading={loading}
                            disabled={!newCategoryName.trim()}
                            style={[styles.modalButton, { flex: 1 }]}
                        >
                            Create
                        </Button>
                    </View>
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
        borderBottomColor: '#1E1E1E',
    },
    title: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: spacing.md,
    },
    searchBar: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        elevation: 0,
        marginBottom: spacing.sm,
    },
    searchInput: {
        color: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    gridContainer: {
        padding: spacing.lg,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: '48%',
        padding: spacing.lg,
        borderRadius: 16,
        marginBottom: spacing.lg,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    categoryName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: spacing.xs,
    },
    documentCount: {
        fontSize: 14,
        color: '#8E8E93',
    },
    fab: {
        position: 'absolute',
        right: spacing.lg,
        bottom: spacing.lg,
        borderRadius: 30,
    },
    modalContainer: {
        backgroundColor: '#1E1E1E',
        padding: spacing.lg,
        margin: spacing.lg,
        borderRadius: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: spacing.lg,
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#8E8E93',
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    },
    modalInput: {
        backgroundColor: '#2C2C2E',
    },
    modalButtons: {
        flexDirection: 'row',
        marginTop: spacing.xl,
        gap: spacing.md,
    },
    modalButton: {
        flex: 1,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2C2C2E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedIcon: {
        backgroundColor: '#007AFF',
    },
});

export default DocumentListScreen; 