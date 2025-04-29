import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme, IconButton, Switch } from 'react-native-paper';
import { spacing } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SecurityScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [pinEnabled, setPinEnabled] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    const menuItems = [
        {
            icon: 'fingerprint',
            label: 'Biometric Authentication',
            description: 'Use fingerprint or face recognition to unlock the app',
            value: biometricEnabled,
            onToggle: () => setBiometricEnabled(!biometricEnabled),
        },
        {
            icon: 'lock-outline',
            label: 'PIN Lock',
            description: 'Set up a PIN code for additional security',
            value: pinEnabled,
            onToggle: () => setPinEnabled(!pinEnabled),
        },
        {
            icon: 'two-factor-authentication',
            label: 'Two-Factor Authentication',
            description: 'Add an extra layer of security to your account',
            value: twoFactorEnabled,
            onToggle: () => setTwoFactorEnabled(!twoFactorEnabled),
        },
    ];

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
        menuCard: {
            backgroundColor: '#1C1C1E',
            borderRadius: 16,
            overflow: 'hidden',
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: '#2C2C2E',
        },
        menuItemLast: {
            borderBottomWidth: 0,
        },
        menuIcon: {
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: '#0A84FF',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing.md,
        },
        menuContent: {
            flex: 1,
            marginRight: spacing.md,
        },
        menuLabel: {
            fontSize: 17,
            color: '#FFFFFF',
            marginBottom: spacing.xs,
        },
        menuDescription: {
            fontSize: 14,
            color: '#8E8E93',
        },
        section: {
            marginBottom: spacing.xl,
        },
        sectionTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: '#8E8E93',
            marginBottom: spacing.md,
            marginLeft: spacing.xs,
            textTransform: 'uppercase',
        },
        passwordButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#1C1C1E',
            padding: spacing.lg,
            borderRadius: 16,
            marginBottom: spacing.md,
        },
        passwordButtonText: {
            flex: 1,
            fontSize: 17,
            color: '#0A84FF',
        },
        chevron: {
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
                <Text style={styles.title}>Security</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Authentication</Text>
                    <View style={styles.menuCard}>
                        {menuItems.map((item, index) => (
                            <View
                                key={item.label}
                                style={[
                                    styles.menuItem,
                                    index === menuItems.length - 1 && styles.menuItemLast,
                                ]}
                            >
                                <View style={styles.menuIcon}>
                                    <MaterialCommunityIcons
                                        name={item.icon}
                                        size={20}
                                        color="#FFFFFF"
                                    />
                                </View>
                                <View style={styles.menuContent}>
                                    <Text style={styles.menuLabel}>{item.label}</Text>
                                    <Text style={styles.menuDescription}>
                                        {item.description}
                                    </Text>
                                </View>
                                <Switch
                                    value={item.value}
                                    onValueChange={item.onToggle}
                                    color="#0A84FF"
                                />
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Password</Text>
                    <TouchableOpacity
                        style={styles.passwordButton}
                        onPress={() => {/* Handle password change */ }}
                    >
                        <Text style={styles.passwordButtonText}>Change Password</Text>
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={24}
                            style={styles.chevron}
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SecurityScreen; 