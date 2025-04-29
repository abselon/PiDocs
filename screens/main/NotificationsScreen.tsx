import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, IconButton, Switch } from 'react-native-paper';
import { spacing } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const NotificationsScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const [pushEnabled, setPushEnabled] = useState(true);
    const [expiryEnabled, setExpiryEnabled] = useState(true);
    const [updateEnabled, setUpdateEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(false);

    const menuItems = [
        {
            icon: 'bell-outline',
            label: 'Push Notifications',
            description: 'Receive notifications on your device',
            value: pushEnabled,
            onToggle: () => setPushEnabled(!pushEnabled),
        },
        {
            icon: 'clock-outline',
            label: 'Document Expiry',
            description: 'Get notified before documents expire',
            value: expiryEnabled,
            onToggle: () => setExpiryEnabled(!expiryEnabled),
        },
        {
            icon: 'update',
            label: 'App Updates',
            description: 'Stay informed about new features',
            value: updateEnabled,
            onToggle: () => setUpdateEnabled(!updateEnabled),
        },
        {
            icon: 'email-outline',
            label: 'Email Notifications',
            description: 'Receive important updates via email',
            value: emailEnabled,
            onToggle: () => setEmailEnabled(!emailEnabled),
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
        note: {
            fontSize: 14,
            color: '#8E8E93',
            textAlign: 'center',
            marginTop: spacing.xl,
            paddingHorizontal: spacing.xl,
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
                <Text style={styles.title}>Notifications</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notification Settings</Text>
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

                <Text style={styles.note}>
                    You can customize how and when you receive notifications.
                    Some notifications cannot be disabled as they are essential
                    for the proper functioning of the app.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

export default NotificationsScreen; 