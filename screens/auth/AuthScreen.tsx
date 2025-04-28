import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { spacing } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

const AuthScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation<AuthScreenNavigationProp>();

    const handleSignIn = async () => {
        try {
            // For testing purposes, using a test account
            await signInWithEmailAndPassword(auth, 'test@example.com', 'password123');
        } catch (error: any) {
            console.error('Error signing in:', error.message);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
            justifyContent: 'center',
            padding: spacing.lg,
        },
        logo: {
            alignItems: 'center',
            marginBottom: spacing.xl,
        },
        title: {
            fontSize: 32,
            fontWeight: 'bold',
            color: theme.colors.onBackground,
            marginTop: spacing.md,
        },
        subtitle: {
            fontSize: 16,
            color: theme.colors.onSurfaceVariant,
            marginTop: spacing.xs,
            textAlign: 'center',
        },
        buttonContainer: {
            marginTop: spacing.xl,
        },
        button: {
            marginBottom: spacing.md,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.logo}>
                <MaterialCommunityIcons
                    name="shield-lock"
                    size={80}
                    color={theme.colors.primary}
                />
                <Text style={styles.title}>PIDocs</Text>
                <Text style={styles.subtitle}>
                    Secure your important documents
                </Text>
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    style={styles.button}
                    onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
                >
                    Sign In
                </Button>
                <Button
                    mode="outlined"
                    style={styles.button}
                    onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
                >
                    Create Account
                </Button>
            </View>
        </View>
    );
};

export default AuthScreen; 