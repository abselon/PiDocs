import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme, TextInput, IconButton } from 'react-native-paper';
import { spacing } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';

const RegisterScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // Registration successful - user will be automatically signed in
        } catch (error: any) {
            setError(error.message);
            console.error('Registration error:', error.message);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.md,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.colors.onBackground,
            marginLeft: spacing.sm,
        },
        content: {
            padding: spacing.lg,
        },
        input: {
            marginBottom: spacing.md,
        },
        error: {
            color: theme.colors.error,
            marginBottom: spacing.md,
        },
        button: {
            marginTop: spacing.md,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    onPress={() => navigation.goBack()}
                />
                <Text style={styles.title}>Create Account</Text>
            </View>
            <View style={styles.content}>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    secureTextEntry
                />
                <TextInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={styles.input}
                    secureTextEntry
                />
                <Button
                    mode="contained"
                    style={styles.button}
                    onPress={handleRegister}
                >
                    Create Account
                </Button>
            </View>
        </View>
    );
};

export default RegisterScreen; 