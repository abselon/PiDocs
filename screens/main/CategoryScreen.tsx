import React from 'react';
import { View, StyleSheet, Platform, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Text, useTheme, IconButton, Card } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { spacing, typography } from '../../theme/theme';
import { useDocuments } from '../../contexts/DocumentContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Document {
    id: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    categoryId: string;
    fileData?: string;
    fileType?: string;
    name?: string;
}

type RootStackParamList = {
    DocumentDetail: { documentId: string };
};

const CategoryScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { documents, categories } = useDocuments();
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
        gridContainer: {
            flex: 1,
        },
        gridItem: {
            width: itemWidth,
            marginRight: spacing.md,
            marginBottom: spacing.md,
        },
        card: {
            borderRadius: 12,
            overflow: 'hidden',
        },
        imageContainer: {
            width: '100%',
            height: itemWidth * 1.2,
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
            padding: spacing.sm,
        },
        documentTitle: {
            fontSize: typography.body.fontSize,
            fontWeight: '500',
            color: theme.colors.onSurface,
            marginTop: spacing.xs,
        },
        documentDescription: {
            fontSize: typography.caption.fontSize,
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

    const renderDocumentItem = ({ item }: { item: Document }) => (
        <TouchableOpacity
            style={styles.gridItem}
            onPress={() => navigation.navigate('DocumentDetail', { documentId: item.id })}
        >
            <Card style={styles.card}>
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
                </View>
                <Card.Content style={styles.cardContent}>
                    <Text style={styles.documentTitle} numberOfLines={1}>
                        {item.name || item.title}
                    </Text>
                    {item.description && (
                        <Text style={styles.documentDescription} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={() => navigation.goBack()}
                />
                <Text style={styles.title}>{categoryName}</Text>
            </View>
            <View style={styles.content}>
                {categoryDocuments.length > 0 ? (
                    <FlatList
                        data={categoryDocuments}
                        keyExtractor={item => item.id}
                        numColumns={numColumns}
                        contentContainerStyle={styles.gridContainer}
                        renderItem={renderDocumentItem}
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