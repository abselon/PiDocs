import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, useTheme, FAB, Searchbar } from 'react-native-paper';
import { spacing } from '../../theme/theme';
import { useDocuments } from '../../contexts/DocumentContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Category } from '../../types/document';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DocumentListScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { documents, categories } = useDocuments();
    const [searchQuery, setSearchQuery] = useState('');

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
                onPress={() => navigation.navigate('AddDocument')}
                color="#FFFFFF"
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
});

export default DocumentListScreen; 