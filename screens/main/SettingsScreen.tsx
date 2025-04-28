import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing } from '../../theme/theme';

const SettingsScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();

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
        settingItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.surfaceVariant,
        },
        settingText: {
            fontSize: 16,
            color: theme.colors.onBackground,
            flex: 1,
            marginLeft: spacing.md,
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
                <Text style={styles.title}>Settings</Text>
            </View>
            <View style={styles.content}>
                <View style={styles.settingItem}>
                    <MaterialCommunityIcons
                        name="theme-light-dark"
                        size={24}
                        color={theme.colors.primary}
                    />
                    <Text style={styles.settingText}>Theme</Text>
                    <IconButton
                        icon="chevron-right"
                        size={24}
                        iconColor={theme.colors.onSurfaceVariant}
                    />
                </View>
                <View style={styles.settingItem}>
                    <MaterialCommunityIcons
                        name="bell-outline"
                        size={24}
                        color={theme.colors.primary}
                    />
                    <Text style={styles.settingText}>Notifications</Text>
                    <IconButton
                        icon="chevron-right"
                        size={24}
                        iconColor={theme.colors.onSurfaceVariant}
                    />
                </View>
                <View style={styles.settingItem}>
                    <MaterialCommunityIcons
                        name="shield-check-outline"
                        size={24}
                        color={theme.colors.primary}
                    />
                    <Text style={styles.settingText}>Security</Text>
                    <IconButton
                        icon="chevron-right"
                        size={24}
                        iconColor={theme.colors.onSurfaceVariant}
                    />
                </View>
                <View style={styles.settingItem}>
                    <MaterialCommunityIcons
                        name="information-outline"
                        size={24}
                        color={theme.colors.primary}
                    />
                    <Text style={styles.settingText}>About</Text>
                    <IconButton
                        icon="chevron-right"
                        size={24}
                        iconColor={theme.colors.onSurfaceVariant}
                    />
                </View>
            </View>
        </View>
    );
};

export default SettingsScreen; 