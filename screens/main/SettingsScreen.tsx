import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { spacing } from '../../theme/theme';
import { useUser } from '../../contexts/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsScreen = () => {
    const theme = useTheme();
    const { logout } = useUser();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#000000',
        },
        header: {
            padding: spacing.lg,
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
            marginBottom: spacing.xl,
        },
        logoutButton: {
            marginHorizontal: spacing.lg,
            marginBottom: spacing.xl,
            backgroundColor: '#FF3B30',
        },
        logoutButtonText: {
            color: '#FFFFFF',
            fontWeight: '600',
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.title}>Settings</Text>
                    <Text style={styles.subtitle}>Manage your account settings</Text>
                </View>

                <Button
                    mode="contained"
                    onPress={handleLogout}
                    style={styles.logoutButton}
                    labelStyle={styles.logoutButtonText}
                >
                    Logout
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SettingsScreen; 