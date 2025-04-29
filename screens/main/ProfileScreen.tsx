import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, useTheme, Avatar } from 'react-native-paper';
import { spacing } from '../../theme/theme';
import { useUser } from '../../contexts/UserContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    PersonalInformation: undefined;
    Security: undefined;
    Notifications: undefined;
    BackupScreen: undefined;
    StorageUsage: undefined;
    EditProfile: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    onPress: () => void;
}

interface MenuSection {
    title: string;
    items: MenuItem[];
}

const ProfileScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { user } = useUser();

    const menuItems: MenuSection[] = [
        {
            title: 'Account',
            items: [
                {
                    icon: 'account',
                    label: 'Personal Information',
                    onPress: () => navigation.navigate('PersonalInformation'),
                },
                {
                    icon: 'shield-lock',
                    label: 'Security',
                    onPress: () => navigation.navigate('Security'),
                },
                {
                    icon: 'bell',
                    label: 'Notifications',
                    onPress: () => navigation.navigate('Notifications'),
                },
            ],
        },
        {
            title: 'Storage',
            items: [
                {
                    icon: 'cloud-sync',
                    label: 'Backup & Sync',
                    onPress: () => navigation.navigate('BackupScreen'),
                },
                {
                    icon: 'database',
                    label: 'Storage Usage',
                    onPress: () => navigation.navigate('StorageUsage'),
                },
            ],
        },
    ];

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
        name: {
            fontSize: 24,
            fontWeight: '600',
            color: '#FFFFFF',
            marginBottom: spacing.xs,
        },
        email: {
            fontSize: 16,
            color: '#8E8E93',
            marginBottom: spacing.lg,
        },
        editButton: {
            backgroundColor: '#007AFF',
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.sm,
            borderRadius: 20,
        },
        editButtonText: {
            color: '#FFFFFF',
            fontWeight: '600',
        },
        section: {
            marginBottom: spacing.xl,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: '#FFFFFF',
            marginLeft: spacing.lg,
            marginBottom: spacing.md,
        },
        menuCard: {
            backgroundColor: '#1C1C1E',
            borderRadius: 16,
            marginHorizontal: spacing.lg,
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
            backgroundColor: '#007AFF',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing.md,
        },
        menuLabel: {
            flex: 1,
            fontSize: 17,
            color: '#FFFFFF',
        },
        chevron: {
            color: '#8E8E93',
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
                    <Text style={styles.name}>{user?.displayName || 'John Doe'}</Text>
                    <Text style={styles.email}>{user?.email || 'john.doe@example.com'}</Text>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {menuItems.map((section, sectionIndex) => (
                    <View key={section.title} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.menuCard}>
                            {section.items.map((item, itemIndex) => (
                                <TouchableOpacity
                                    key={item.label}
                                    style={[
                                        styles.menuItem,
                                        itemIndex === section.items.length - 1 && styles.menuItemLast,
                                    ]}
                                    onPress={item.onPress}
                                >
                                    <View style={styles.menuIcon}>
                                        <MaterialCommunityIcons
                                            name={item.icon}
                                            size={20}
                                            color="#FFFFFF"
                                        />
                                    </View>
                                    <Text style={styles.menuLabel}>{item.label}</Text>
                                    <MaterialCommunityIcons
                                        name="chevron-right"
                                        size={24}
                                        style={styles.chevron}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileScreen; 