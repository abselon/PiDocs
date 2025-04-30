import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Avatar } from 'react-native-paper';
import { spacing } from '../../theme/theme';
import { useUser } from '../../contexts/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = () => {
    const theme = useTheme();
    const { user } = useUser();

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
        profileCard: {
            backgroundColor: '#1C1C1E',
            borderRadius: 16,
            padding: spacing.xl,
            marginHorizontal: spacing.lg,
            marginBottom: spacing.xl,
            alignItems: 'center',
        },
        avatar: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#007AFF',
            marginBottom: spacing.md,
        },
        email: {
            fontSize: 16,
            color: '#8E8E93',
            marginBottom: spacing.lg,
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.title}>Profile</Text>
                    <Text style={styles.subtitle}>Manage your account and preferences</Text>
                </View>

                <View style={styles.profileCard}>
                    <Avatar.Icon
                        size={80}
                        icon="account"
                        style={styles.avatar}
                        color="#FFFFFF"
                    />
                    <Text style={styles.email}>{user?.email || 'john.doe@example.com'}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileScreen; 