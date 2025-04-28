import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { spacing, typography } from '../../theme/theme';

const CategoryListScreen: React.FC = () => {
    const theme = useTheme();

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                    Categories
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                    Organize your documents
                </Text>
            </View>

            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                    <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                        No categories found
                    </Text>
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.md,
    },
    header: {
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.title,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
    },
    card: {
        marginBottom: spacing.md,
        borderRadius: 12,
        elevation: 0,
        shadowOpacity: 0,
    },
    emptyText: {
        ...typography.body,
    },
});

export default CategoryListScreen; 