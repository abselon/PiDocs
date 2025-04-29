import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { spacing, typography, shadows } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type AuthScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Auth'>;

const AuthScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation<AuthScreenNavigationProp>();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.surfaceVariant,
        },
        content: {
            flex: 1,
            justifyContent: 'center',
            padding: spacing.lg,
        },
        logo: {
            alignItems: 'center',
            marginBottom: spacing.xxl,
        },
        logoIcon: {
            backgroundColor: theme.colors.primary,
            width: 80,
            height: 80,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            ...shadows.medium,
        },
        title: {
            ...typography.h1,
            color: theme.colors.onSurfaceVariant,
            textAlign: 'center',
            marginTop: spacing.lg,
        },
        subtitle: {
            ...typography.body,
            color: theme.colors.onSurfaceVariant,
            textAlign: 'center',
            marginTop: spacing.sm,
            marginBottom: spacing.xxl,
        },
        buttonContainer: {
            gap: spacing.md,
        },
        button: {
            borderRadius: 12,
            backgroundColor: theme.colors.surface,
        },
        outlinedButton: {
            borderColor: theme.colors.primary,
            borderWidth: 2,
            backgroundColor: theme.colors.surface,
        },
        buttonLabel: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.onSurface,
        },
        footer: {
            padding: spacing.lg,
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
        },
        footerText: {
            ...typography.caption,
            color: theme.colors.onSurfaceVariant,
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logo}>
                    <View style={styles.logoIcon}>
                        <MaterialCommunityIcons
                            name="file-document-multiple"
                            size={40}
                            color="white"
                        />
                    </View>
                    <Text style={styles.title}>PiDocs</Text>
                    <Text style={styles.subtitle}>
                        Securely store and manage your important documents
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate('Login')}
                        style={styles.button}
                        labelStyle={styles.buttonLabel}
                        contentStyle={{ height: 50 }}
                    >
                        Sign In
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={() => navigation.navigate('Register')}
                        style={[styles.button, styles.outlinedButton]}
                        labelStyle={[styles.buttonLabel, { color: theme.colors.primary }]}
                        contentStyle={{ height: 50 }}
                    >
                        Create Account
                    </Button>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    By continuing, you agree to our Terms & Privacy Policy
                </Text>
            </View>
        </SafeAreaView>
    );
};

export default AuthScreen; 