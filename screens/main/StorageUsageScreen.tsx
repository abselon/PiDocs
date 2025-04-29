import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, IconButton, ProgressBar } from 'react-native-paper';
import { spacing } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDocuments } from '../../contexts/DocumentContext';

const StorageUsageScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { documents } = useDocuments();

    // Calculate storage usage
    const totalStorage = 1024 * 1024 * 1024; // 1GB in bytes
    const usedStorage = documents.reduce((total, doc) => {
        return total + (doc.fileSize || 0);
    }, 0);
    const usedPercentage = (usedStorage / totalStorage) * 100;

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    const categoryUsage = documents.reduce((acc, doc) => {
        const category = doc.categoryId || 'uncategorized';
        if (!acc[category]) {
            acc[category] = {
                size: 0,
                count: 0,
            };
        }
        acc[category].size += doc.fileSize || 0;
        acc[category].count += 1;
        return acc;
    }, {} as Record<string, { size: number; count: number }>);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#000000',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: '#1C1C1E',
        },
        title: {
            fontSize: 20,
            fontWeight: '600',
            color: '#FFFFFF',
            flex: 1,
        },
        content: {
            padding: spacing.lg,
        },
        storageCard: {
            backgroundColor: '#1C1C1E',
            borderRadius: 16,
            padding: spacing.lg,
            marginBottom: spacing.xl,
        },
        storageHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.lg,
        },
        storageIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#0A84FF',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing.md,
        },
        storageTitle: {
            fontSize: 17,
            fontWeight: '600',
            color: '#FFFFFF',
        },
        storageInfo: {
            marginBottom: spacing.md,
        },
        storageText: {
            fontSize: 14,
            color: '#8E8E93',
            marginBottom: spacing.xs,
        },
        progressContainer: {
            marginTop: spacing.md,
        },
        progressBar: {
            height: 8,
            borderRadius: 4,
        },
        usageDetails: {
            marginTop: spacing.md,
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        usageText: {
            fontSize: 12,
            color: '#8E8E93',
        },
        categorySection: {
            marginTop: spacing.xl,
        },
        sectionTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: '#8E8E93',
            marginBottom: spacing.md,
            marginLeft: spacing.xs,
            textTransform: 'uppercase',
        },
        categoryCard: {
            backgroundColor: '#1C1C1E',
            borderRadius: 16,
            overflow: 'hidden',
        },
        categoryItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: '#2C2C2E',
        },
        categoryItemLast: {
            borderBottomWidth: 0,
        },
        categoryIcon: {
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: '#0A84FF',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing.md,
        },
        categoryContent: {
            flex: 1,
        },
        categoryName: {
            fontSize: 17,
            color: '#FFFFFF',
            marginBottom: spacing.xs,
        },
        categoryStats: {
            fontSize: 14,
            color: '#8E8E93',
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    iconColor="#FFFFFF"
                    size={24}
                    onPress={() => navigation.goBack()}
                />
                <Text style={styles.title}>Storage Usage</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.storageCard}>
                    <View style={styles.storageHeader}>
                        <View style={styles.storageIcon}>
                            <MaterialCommunityIcons
                                name="cloud-outline"
                                size={24}
                                color="#FFFFFF"
                            />
                        </View>
                        <Text style={styles.storageTitle}>Storage Space</Text>
                    </View>

                    <View style={styles.storageInfo}>
                        <Text style={styles.storageText}>
                            {formatSize(usedStorage)} of {formatSize(totalStorage)} used
                        </Text>
                    </View>

                    <View style={styles.progressContainer}>
                        <ProgressBar
                            progress={usedPercentage / 100}
                            color="#0A84FF"
                            style={styles.progressBar}
                        />
                        <View style={styles.usageDetails}>
                            <Text style={styles.usageText}>
                                {usedPercentage.toFixed(1)}% used
                            </Text>
                            <Text style={styles.usageText}>
                                {formatSize(totalStorage - usedStorage)} free
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.categorySection}>
                    <Text style={styles.sectionTitle}>Storage by Category</Text>
                    <View style={styles.categoryCard}>
                        {Object.entries(categoryUsage).map(([categoryId, usage], index, array) => (
                            <View
                                key={categoryId}
                                style={[
                                    styles.categoryItem,
                                    index === array.length - 1 && styles.categoryItemLast,
                                ]}
                            >
                                <View style={styles.categoryIcon}>
                                    <MaterialCommunityIcons
                                        name="folder-outline"
                                        size={20}
                                        color="#FFFFFF"
                                    />
                                </View>
                                <View style={styles.categoryContent}>
                                    <Text style={styles.categoryName}>
                                        {categoryId === 'uncategorized' ? 'Uncategorized' : categoryId}
                                    </Text>
                                    <Text style={styles.categoryStats}>
                                        {usage.count} items • {formatSize(usage.size)}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default StorageUsageScreen; 