import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, typography, shadows } from '../theme/theme';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
}

const CustomAlert: React.FC<CustomAlertProps> = ({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'OK',
    cancelText = 'Cancel',
    type = 'info'
}) => {
    const theme = useTheme();

    const getIcon = () => {
        switch (type) {
            case 'success':
                return 'check-circle';
            case 'error':
                return 'alert-circle';
            case 'warning':
                return 'alert';
            default:
                return 'information';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'success':
                return theme.colors.primary;
            case 'error':
                return theme.colors.error;
            case 'warning':
                return theme.colors.warning;
            default:
                return theme.colors.primary;
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons
                            name={getIcon()}
                            size={48}
                            color={getIconColor()}
                        />
                    </View>
                    <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                        {title}
                    </Text>
                    <Text style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
                        {message}
                    </Text>
                    <View style={styles.buttonContainer}>
                        {onCancel && (
                            <Button
                                mode="outlined"
                                onPress={onCancel}
                                style={[styles.button, { marginRight: spacing.sm }]}
                                textColor={theme.colors.primary}
                            >
                                {cancelText}
                            </Button>
                        )}
                        <Button
                            mode="contained"
                            onPress={onConfirm}
                            style={styles.button}
                            buttonColor={theme.colors.primary}
                        >
                            {confirmText}
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    container: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 16,
        padding: spacing.xl,
        ...shadows.medium,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h6,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    message: {
        ...typography.body,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    button: {
        flex: 1,
        minWidth: 100,
    },
});

export default CustomAlert; 