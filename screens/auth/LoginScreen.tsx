import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TextStyle } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { spacing, typography, shadows } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword, Auth, getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../config/firebase';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Alert } from 'react-native';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Navigation will be handled by the auth state listener
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.surfaceVariant,
        },
        content: {
            flex: 1,
            padding: spacing.lg,
        },
        header: {
            alignItems: 'center',
            marginTop: spacing.xxl,
            marginBottom: spacing.xl,
            backgroundColor: theme.colors.surface,
            padding: spacing.lg,
            borderRadius: 12,
            ...shadows.small,
        },
        title: {
            color: theme.colors.onSurface,
            marginBottom: spacing.md,
            fontSize: typography.h1.fontSize,
            fontWeight: '600' as TextStyle['fontWeight'],
        },
        subtitle: {
            ...typography.body,
            color: theme.colors.onSurfaceVariant,
            textAlign: 'center',
        },
        form: {
            gap: spacing.md,
            marginTop: spacing.xl,
            backgroundColor: theme.colors.surface,
            padding: spacing.lg,
            borderRadius: 12,
            ...shadows.small,
        },
        input: {
            backgroundColor: theme.colors.surfaceVariant,
            fontSize: 16,
        },
        error: {
            color: theme.colors.error,
            ...typography.caption,
            marginTop: spacing.xs,
        },
        button: {
            marginTop: spacing.lg,
            borderRadius: 12,
            backgroundColor: theme.colors.primary,
        },
        buttonLabel: {
            fontSize: 16,
            fontWeight: '600' as const,
            color: theme.colors.onPrimary,
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.lg,
            gap: spacing.xs,
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            marginTop: spacing.lg,
            ...shadows.small,
        },
        footerText: {
            ...typography.body,
            color: theme.colors.onSurfaceVariant,
        },
        footerLink: {
            ...typography.body,
            color: theme.colors.primary,
            fontWeight: '600' as const,
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>
                        Sign in to access your documents
                    </Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                        left={<TextInput.Icon icon="email" />}
                    />
                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        mode="outlined"
                        secureTextEntry
                        style={styles.input}
                        left={<TextInput.Icon icon="lock" />}
                    />
                    {error ? <Text style={styles.error}>{error}</Text> : null}
                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                        labelStyle={styles.buttonLabel}
                        contentStyle={{ height: 50 }}
                    >
                        Sign In
                    </Button>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account?</Text>
                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('Register')}
                        labelStyle={styles.footerLink}
                    >
                        Sign Up
                    </Button>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen; 