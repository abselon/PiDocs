import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDocuments } from '../../contexts/DocumentContext';
import { DocumentWithStatus } from '../../types/document';
import { spacing, typography, shadows } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { TextStyle } from 'react-native';
import { Timestamp } from 'firebase/firestore';

type RootStackParamList = {
    Home: undefined;
    AddDocument: undefined;
    Categories: { category?: string };
    DocumentDetails: { documentId: string };
    ScanID: undefined;
    Settings: undefined;
    Backup: undefined;
    BrowseDocs: undefined;
    Profile: undefined;
};

type NavigationProp = {
    navigate: (screen: keyof RootStackParamList, params?: any) => void;
};

const createStyles = (theme: MD3Theme['colors']) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    header: {
        paddingTop: (StatusBar.currentHeight || 0) + spacing.lg,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        backgroundColor: theme.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.surfaceVariant,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flex: 1,
    },
    appTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.onSurface,
        marginBottom: spacing.xs,
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surfaceVariant,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    securityText: {
        marginLeft: spacing.xs,
        color: theme.onSurfaceVariant,
        fontSize: 12,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: spacing.lg,
    },
    gridItem: {
        width: '48%',
        aspectRatio: 1,
        backgroundColor: theme.surface,
        borderRadius: 20,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.medium,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.surfaceVariant,
    },
    gridItemIcon: {
        marginBottom: spacing.md,
    },
    gridItemText: {
        color: theme.onSurface,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    overview: {
        marginTop: spacing.lg,
        marginBottom: spacing.xl * 2,
        backgroundColor: theme.surface,
        borderRadius: 20,
        padding: spacing.lg,
        ...shadows.medium,
        borderWidth: 1,
        borderColor: theme.surfaceVariant,
    },
    overviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    overviewTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.onSurface,
    },
    overviewSubtitle: {
        fontSize: 14,
        color: theme.onSurfaceVariant,
        marginTop: spacing.xs,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
        backgroundColor: theme.surfaceVariant,
        padding: spacing.md,
        borderRadius: 12,
        width: '30%',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.onSurface,
        marginTop: spacing.xs,
    },
    statLabel: {
        fontSize: 14,
        color: theme.onSurfaceVariant,
        marginTop: spacing.xs,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    headerButton: {
        backgroundColor: theme.surfaceVariant,
        borderRadius: 12,
        padding: spacing.sm,
    },
});

const HomeScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { documents, loading } = useDocuments();
    const styles = createStyles(theme.colors);

    const stats = useMemo(() => {
        if (!documents) return { total: 0, active: 0, expiring: 0 };
        const today = new Date();
        const expiring = documents.filter(doc => {
            if (!doc.expiryDate) return false;

            // Convert Timestamp to Date
            const expiryDate = doc.expiryDate instanceof Timestamp
                ? doc.expiryDate.toDate()
                : new Date(doc.expiryDate);

            if (isNaN(expiryDate.getTime())) return false;

            const diffTime = expiryDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 30 && diffDays >= 0;
        }).length;

        return {
            total: documents.length,
            active: documents.filter(doc => {
                if (!doc.expiryDate) return true;
                const expiryDate = doc.expiryDate instanceof Timestamp
                    ? doc.expiryDate.toDate()
                    : new Date(doc.expiryDate);
                return !isNaN(expiryDate.getTime()) && expiryDate > today;
            }).length,
            expiring,
        };
    }, [documents]);

    const getExpiringPercentage = () => {
        if (!stats.total) return 0;
        return Math.round((stats.expiring / stats.total) * 100);
    };

    const getExpiringColor = () => {
        const percentage = getExpiringPercentage();
        if (percentage > 30) return theme.colors.error;
        if (percentage > 10) return theme.colors.tertiary;
        return theme.colors.primary;
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.appTitle}>PiDocs</Text>
                    <View style={styles.securityBadge}>
                        <MaterialCommunityIcons name="shield-check" size={16} color={theme.colors.primary} />
                        <Text style={styles.securityText}>Secured</Text>
                    </View>
                </View>
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <MaterialCommunityIcons
                            name="account"
                            size={24}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <MaterialCommunityIcons
                            name="cog"
                            size={24}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.grid}>
                    <TouchableOpacity
                        style={styles.gridItem}
                        onPress={() => navigation.navigate('AddDocument')}
                    >
                        <MaterialCommunityIcons
                            name="plus-circle"
                            size={40}
                            color={theme.colors.primary}
                            style={styles.gridItemIcon}
                        />
                        <Text style={styles.gridItemText}>Add Document</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.gridItem}
                        onPress={() => navigation.navigate('BrowseDocs')}
                    >
                        <MaterialCommunityIcons
                            name="folder-search"
                            size={40}
                            color={theme.colors.primary}
                            style={styles.gridItemIcon}
                        />
                        <Text style={styles.gridItemText}>Browse Docs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.gridItem}
                        onPress={() => navigation.navigate('ScanID')}
                    >
                        <MaterialCommunityIcons
                            name="camera"
                            size={40}
                            color={theme.colors.primary}
                            style={styles.gridItemIcon}
                        />
                        <Text style={styles.gridItemText}>Scan ID</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.gridItem}
                        onPress={() => navigation.navigate('Backup')}
                    >
                        <MaterialCommunityIcons
                            name="cloud-upload"
                            size={40}
                            color={theme.colors.primary}
                            style={styles.gridItemIcon}
                        />
                        <Text style={styles.gridItemText}>Backup</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.overview}>
                    <View style={styles.overviewHeader}>
                        <View>
                            <Text style={styles.overviewTitle}>Overview</Text>
                            <Text style={styles.overviewSubtitle}>Your document status</Text>
                        </View>
                        <MaterialCommunityIcons
                            name="chart-line"
                            size={24}
                            color={theme.colors.primary}
                        />
                    </View>

                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons
                                name="folder"
                                size={24}
                                color={theme.colors.primary}
                            />
                            <Text style={styles.statValue}>{stats.total}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>

                        <View style={styles.statItem}>
                            <MaterialCommunityIcons
                                name="check-circle"
                                size={24}
                                color={theme.colors.primary}
                            />
                            <Text style={styles.statValue}>{stats.active}</Text>
                            <Text style={styles.statLabel}>Active</Text>
                        </View>

                        <View style={styles.statItem}>
                            <MaterialCommunityIcons
                                name="alert-circle"
                                size={24}
                                color={getExpiringColor()}
                            />
                            <Text style={[styles.statValue, { color: getExpiringColor() }]}>
                                {stats.expiring}
                            </Text>
                            <Text style={styles.statLabel}>Expiring</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default HomeScreen; 