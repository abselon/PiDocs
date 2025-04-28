import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Card, useTheme } from 'react-native-paper';

interface CardViewProps {
    children: React.ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
}

const CardView: React.FC<CardViewProps> = ({ children, style, onPress }) => {
    const theme = useTheme();

    return (
        <Card
            style={[
                styles.card,
                {
                    backgroundColor: theme.dark ? '#1C1C1E' : '#FFFFFF',
                    borderColor: theme.dark ? '#2C2C2E' : '#E5E5EA',
                },
                style,
            ]}
            onPress={onPress}
        >
            <View style={styles.content}>{children}</View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        elevation: 0,
    },
    content: {
        padding: 16,
    },
});

export default CardView; 