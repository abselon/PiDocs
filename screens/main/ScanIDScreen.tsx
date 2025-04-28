import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing } from '../../theme/theme';

const ScanIDScreen: React.FC = () => {
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
            paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
                <Text style={styles.title}>Scan ID</Text>
            </View>
            <View style={styles.content}>
                <MaterialCommunityIcons
                    name="camera"
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

export default ScanIDScreen; 