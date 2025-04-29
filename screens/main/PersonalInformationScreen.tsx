import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, TextInput, Button, IconButton } from 'react-native-paper';
import { spacing } from '../../theme/theme';
import { useUser } from '../../contexts/UserContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PersonalInformationScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { user, updateUserProfile } = useUser();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
    });

    const handleSave = async () => {
        try {
            setLoading(true);
            await updateUserProfile({
                displayName: formData.displayName,
                // Note: Email and phone updates typically require verification
                // and should be handled separately with proper security measures
            });
            navigation.goBack();
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

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
        inputContainer: {
            backgroundColor: '#1C1C1E',
            borderRadius: 16,
            padding: spacing.lg,
            marginBottom: spacing.xl,
        },
        inputLabel: {
            fontSize: 14,
            color: '#8E8E93',
            marginBottom: spacing.xs,
        },
        input: {
            backgroundColor: '#2C2C2E',
            marginBottom: spacing.lg,
        },
        button: {
            marginTop: spacing.md,
        },
        note: {
            fontSize: 14,
            color: '#8E8E93',
            textAlign: 'center',
            marginTop: spacing.lg,
            paddingHorizontal: spacing.xl,
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    size={24}
                    color="#FFFFFF"
                    onPress={() => navigation.goBack()}
                />
                <Text style={styles.title}>Personal Information</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <TextInput
                        value={formData.displayName}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
                        style={styles.input}
                        mode="outlined"
                        outlineColor="#3A3A3C"
                        activeOutlineColor="#0A84FF"
                        textColor="#FFFFFF"
                    />

                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput
                        value={formData.email}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                        style={styles.input}
                        mode="outlined"
                        outlineColor="#3A3A3C"
                        activeOutlineColor="#0A84FF"
                        textColor="#FFFFFF"
                        disabled
                    />

                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <TextInput
                        value={formData.phoneNumber}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
                        style={styles.input}
                        mode="outlined"
                        outlineColor="#3A3A3C"
                        activeOutlineColor="#0A84FF"
                        textColor="#FFFFFF"
                        keyboardType="phone-pad"
                    />

                    <Button
                        mode="contained"
                        onPress={handleSave}
                        loading={loading}
                        style={styles.button}
                        buttonColor="#0A84FF"
                    >
                        Save Changes
                    </Button>
                </View>

                <Text style={styles.note}>
                    Some information, like email address, may require additional verification to update
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PersonalInformationScreen; 