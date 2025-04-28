import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Card, useTheme, Button, Chip, Searchbar } from 'react-native-paper';
import { spacing, typography, shadows } from '../../theme/theme';
import { useDocuments } from '../../contexts/DocumentContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FAB } from 'react-native-paper';
import { DocumentsStackParamList } from '../../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<DocumentsStackParamList>;

const DocumentListScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { documents, categories } = useDocuments();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDocuments = documents.filter(doc => {
        const matchesCategory = !selectedCategory || doc.categoryId === selectedCategory;
        const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (doc.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                    Documents
                </Text>
                <Searchbar
                    placeholder="Search documents"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
                />
                <View style={styles.categoriesContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesScroll}
                    >
                        <Chip
                            selected={!selectedCategory}
                            onPress={() => setSelectedCategory(null)}
                            style={styles.categoryChip}
                        >
                            All
                        </Chip>
                        {categories.map(category => (
                            <Chip
                                key={category.id}
                                selected={selectedCategory === category.id}
                                onPress={() => setSelectedCategory(category.id)}
                                style={styles.categoryChip}
                            >
                                {category.name}
                            </Chip>
                        ))}
                    </ScrollView>
                </View>
            </View>

            <FlatList
                data={filteredDocuments}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('DocumentDetail', { documentId: item.id })}
                    >
                        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                            <Card.Content>
                                <View style={styles.cardHeader}>
                                    <MaterialCommunityIcons
                                        name="file-document"
                                        size={24}
                                        color={theme.colors.primary}
                                    />
                                    <Text style={[styles.documentTitle, { color: theme.colors.onSurface }]}>
                                        {item.title}
                                    </Text>
                                </View>
                                <Text style={[styles.documentDescription, { color: theme.colors.onSurfaceVariant }]}>
                                    {item.description}
                                </Text>
                                <View style={styles.cardFooter}>
                                    <Chip
                                        style={[styles.categoryChip, { backgroundColor: theme.colors.surfaceVariant }]}
                                    >
                                        {categories.find(c => c.id === item.categoryId)?.name || 'Uncategorized'}
                                    </Chip>
                                    {item.expiryDate && (
                                        <Text style={[styles.expiryDate, { color: theme.colors.error }]}>
                                            Expires: {new Date(item.expiryDate).toLocaleDateString()}
                                        </Text>
                                    )}
                                </View>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                )}
            />

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
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
    },
    title: {
        ...typography.title,
        marginBottom: spacing.md,
    },
    searchBar: {
        marginBottom: spacing.md,
    },
    categoriesContainer: {
        marginBottom: spacing.md,
    },
    categoriesScroll: {
        paddingRight: spacing.lg,
    },
    categoryChip: {
        marginRight: spacing.sm,
    },
    listContent: {
        padding: spacing.lg,
    },
    card: {
        marginBottom: spacing.md,
        ...shadows.small,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    documentTitle: {
        ...typography.subtitle,
        marginLeft: spacing.sm,
        flex: 1,
    },
    documentDescription: {
        ...typography.body,
        marginBottom: spacing.sm,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    expiryDate: {
        ...typography.caption,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});

export default DocumentListScreen; 