import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { spacing } from '../../theme/theme';
import { useNavigation, useRoute } from '@react-navigation/native';

const DocumentDetailsScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { document } = route.params as { document: any };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.md,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.colors.onBackground,
            marginLeft: spacing.sm,
        },
        content: {
            padding: spacing.lg,
        },
        section: {
            marginBottom: spacing.lg,
        },
        label: {
            fontSize: 14,
            color: theme.colors.onSurfaceVariant,
            marginBottom: spacing.xs,
        },
        value: {
            fontSize: 16,
            color: theme.colors.onBackground,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    onPress={() => navigation.goBack()}
                />
                <Text style={styles.title}>Document Details</Text>
            </View>
            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.label}>Title</Text>
                    <Text style={styles.value}>{document?.title || 'Untitled'}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.label}>Category</Text>
                    <Text style={styles.value}>{document?.category || 'Uncategorized'}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.label}>Expiration Date</Text>
                    <Text style={styles.value}>{document?.expirationDate || 'No expiration date'}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.label}>Notes</Text>
                    <Text style={styles.value}>{document?.notes || 'No notes'}</Text>
                </View>
            </View>
        </View>
    );
};

export default DocumentDetailsScreen; 