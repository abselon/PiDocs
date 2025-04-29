import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { spacing } from '../../theme/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDocuments } from '../../contexts/DocumentContext';
import { Document } from '../../types/document';

const DocumentDetailsScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { documentId } = route.params as { documentId: string };
    const { documents } = useDocuments();
    const [document, setDocument] = useState<Document | null>(null);

    useEffect(() => {
        const doc = documents.find(d => d.id === documentId);
        setDocument(doc || null);
    }, [documentId, documents]);

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

    if (!document) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <IconButton
                        icon="arrow-left"
                        onPress={() => navigation.goBack()}
                    />
                    <Text style={styles.title}>Document Not Found</Text>
                </View>
            </View>
        );
    }

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
                    <Text style={styles.value}>{document.title}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.label}>Description</Text>
                    <Text style={styles.value}>{document.description || 'No description'}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.label}>File Name</Text>
                    <Text style={styles.value}>{document.fileName}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.label}>File Size</Text>
                    <Text style={styles.value}>
                        {document.fileSize ? `${Math.round(document.fileSize / 1024)} KB` : 'Unknown'}
                    </Text>
                </View>
                {document.expiryDate && (
                    <View style={styles.section}>
                        <Text style={styles.label}>Expiry Date</Text>
                        <Text style={styles.value}>
                            {document.expiryDate.toLocaleDateString()}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default DocumentDetailsScreen; 