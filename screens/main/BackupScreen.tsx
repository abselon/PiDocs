import React from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing } from '../../theme/theme';

const BackupScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: (StatusBar.currentHeight || 0) + spacing.md,
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.md,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.colors.onBackground,
            marginLeft: spacing.md,
        },
        content: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
        },
        message: {
            fontSize: 16,
            color: theme.colors.onSurfaceVariant,
            textAlign: 'center',
            marginTop: spacing.md,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={() => navigation.goBack()}
                />
                <Text style={styles.title}>Backup</Text>
            </View>
            <View style={styles.content}>
                <MaterialCommunityIcons
                    name="cloud-upload"
                    size={64}
                    color={theme.colors.primary}
                />
                <Text style={styles.message}>
                    This feature is coming soon!
                </Text>
            </View>
        </View>
    );
};

export default BackupScreen; 