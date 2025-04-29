import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Theme } from '@react-navigation/native';

export type CustomTheme = typeof MD3LightTheme & {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        surfaceVariant: string;
        onSurface: string;
        onSurfaceVariant: string;
        onBackground: string;
        onPrimary: string;
        text: string;
        textSecondary: string;
        error: string;
        warning: string;
        success: string;
        card: string;
        border: string;
        notification: string;
        gradientStart: string;
        gradientEnd: string;
    };
};

// Extend the MD3Colors type to include our custom colors
declare module 'react-native-paper' {
    interface MD3Colors {
        accent: string;
        success: string;
        warning: string;
        info: string;
        textSecondary: string;
        border: string;
        placeholder: string;
        onSurface: string;
        onSurfaceVariant: string;
        gradientStart: string;
        gradientEnd: string;
    }
}

const darkColors = {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    accent: '#FF9F0A',
    background: '#000000',
    surface: '#1C1C1E',
    surfaceVariant: '#2C2C2E',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#8E8E93',
    onBackground: '#FFFFFF',
    onPrimary: '#FFFFFF',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    error: '#FF453A',
    warning: '#FF9F0A',
    success: '#32D74B',
    card: '#1C1C1E',
    border: '#38383A',
    notification: '#FF453A',
    gradientStart: '#0A84FF',
    gradientEnd: '#5E5CE6',
};

const lightColors = {
    ...darkColors,
    background: '#FFFFFF',
    surface: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#E5E5EA',
    onSurface: '#000000',
    onSurfaceVariant: '#8E8E93',
};

export const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        ...darkColors,
    },
    dark: true,
} as unknown as Theme;

// Force dark theme
export const lightTheme = darkTheme;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    h2: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    h3: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    body: {
        fontSize: 16,
    },
    caption: {
        fontSize: 12,
    },
};

export const shadows = {
    small: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.37,
        shadowRadius: 7.49,
        elevation: 6,
    },
}; 