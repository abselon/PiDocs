import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';

interface InputFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    style?: ViewStyle;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    error?: boolean;
    helperText?: string;
    multiline?: boolean;
    numberOfLines?: number;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    value,
    onChangeText,
    style,
    secureTextEntry,
    keyboardType,
    error,
    helperText,
    multiline,
    numberOfLines,
}) => {
    const theme = useTheme();

    return (
        <TextInput
            label={label}
            value={value}
            onChangeText={onChangeText}
            mode="outlined"
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={numberOfLines}
            style={[
                styles.input,
                {
                    backgroundColor: theme.dark ? '#1C1C1E' : '#FFFFFF',
                },
                style,
            ]}
            theme={{
                colors: {
                    primary: theme.colors.primary,
                    error: theme.colors.error,
                    text: theme.dark ? '#FFFFFF' : '#000000',
                    placeholder: theme.dark ? '#8E8E93' : '#8E8E93',
                },
            }}
            outlineColor={theme.dark ? '#2C2C2E' : '#E5E5EA'}
            activeOutlineColor={theme.colors.primary}
            error={error}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        marginBottom: 16,
        borderRadius: 8,
    },
});

export default InputField; 