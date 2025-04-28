import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, useTheme, Button, Avatar } from 'react-native-paper';
import { spacing, typography, shadows } from '../../theme/theme';
import { useUser } from '../../contexts/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen: React.FC = () => {
    const theme = useTheme();
    const { user, logout } = useUser();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Avatar.Text
                        size={80}
                        label={user?.displayName?.charAt(0) || 'U'}
                        style={{ backgroundColor: theme.colors.primary }}
                    />
                    <Text style={[styles.name, { color: theme.colors.onSurface }]}>
                        {user?.displayName || 'User'}
                    </Text>
                    <Text style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>
                        {user?.email}
                    </Text>
                </View>

                <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                            Account Settings
                        </Text>
                        <Button
                            mode="outlined"
                            onPress={() => { }}
                            style={styles.button}
                        >
                            Edit Profile
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => { }}
                            style={styles.button}
                        >
                            Change Password
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => { }}
                            style={styles.button}
                        >
                            Notification Settings
                        </Button>
                    </Card.Content>
                </Card>

                <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                            App Settings
                        </Text>
                        <Button
                            mode="outlined"
                            onPress={() => { }}
                            style={styles.button}
                        >
                            Theme Settings
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => { }}
                            style={styles.button}
                        >
                            Language
                        </Button>
                    </Card.Content>
                </Card>

                <Button
                    mode="contained"
                    onPress={logout}
                    style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
                >
                    Logout
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    name: {
        ...typography.title,
        marginTop: spacing.md,
    },
    email: {
        ...typography.body,
        marginTop: spacing.xs,
    },
    card: {
        marginBottom: spacing.lg,
        ...shadows.small,
    },
    sectionTitle: {
        ...typography.subtitle,
        marginBottom: spacing.md,
    },
    button: {
        marginBottom: spacing.md,
    },
    logoutButton: {
        marginTop: spacing.xl,
    },
});

export default ProfileScreen; 