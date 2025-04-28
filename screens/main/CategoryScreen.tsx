import React from 'react';
import { View, StyleSheet, Platform, FlatList } from 'react-native';
import { Text, useTheme, IconButton, Card } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { spacing, typography } from '../../theme/theme';
import { useDocuments } from '../../contexts/DocumentContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CategoryScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { documents } = useDocuments();
    const category = (route.params as any)?.category;

    const categoryDocuments = documents.filter(doc => doc.categoryId === category);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
            paddingHorizontal: spacing.lg,
        },
        listContent: {
            paddingBottom: spacing.lg,
        },
        card: {
            marginBottom: spacing.md,
            borderRadius: 12,
        },
        cardContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        documentIcon: {
            marginRight: spacing.md,
        },
        documentInfo: {
            flex: 1,
        },
        documentTitle: {
            fontSize: typography.h3.fontSize,
            fontWeight: typography.h3.fontWeight as any,
            color: theme.colors.onSurface,
        },
        documentDescription: {
            fontSize: typography.body.fontSize,
            color: theme.colors.onSurfaceVariant,
            marginTop: spacing.xs,
        },
        emptyMessage: {
            ...typography.body,
            color: theme.colors.onSurfaceVariant,
            textAlign: 'center',
            marginTop: spacing.xl,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={() => navigation.goBack()}
                />
                <Text style={styles.title}>{category || 'Category'}</Text>
            </View>
            <View style={styles.content}>
                {categoryDocuments.length > 0 ? (
                    <FlatList
                        data={categoryDocuments}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => (
                            <Card style={styles.card}>
                                <Card.Content style={styles.cardContent}>
                                    <MaterialCommunityIcons
                                        name="file-document"
                                        size={24}
                                        color={theme.colors.primary}
                                        style={styles.documentIcon}
                                    />
                                    <View style={styles.documentInfo}>
                                        <Text style={styles.documentTitle}>{item.title}</Text>
                                        {item.description && (
                                            <Text style={styles.documentDescription}>
                                                {item.description}
                                            </Text>
                                        )}
                                    </View>
                                </Card.Content>
                            </Card>
                        )}
                    />
                ) : (
                    <Text style={styles.emptyMessage}>
                        No documents found in this category
                    </Text>
                )}
            </View>
        </View>
    );
};

export default CategoryScreen; 