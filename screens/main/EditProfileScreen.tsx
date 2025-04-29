import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme, IconButton, TextInput, Avatar } from 'react-native-paper';
import { spacing } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../contexts/UserContext';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { user, updateUserProfile } = useUser();
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
    });

    const handleImagePick = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setProfileImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await updateUserProfile({
                displayName: formData.displayName,
                photoURL: profileImage,
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
        avatarContainer: {
            alignItems: 'center',
            marginVertical: spacing.xl,
        },
        avatar: {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: '#0A84FF',
        },
        changePhotoButton: {
            marginTop: spacing.md,
        },
        changePhotoText: {
            color: '#0A84FF',
            fontSize: 17,
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
        saveButton: {
            backgroundColor: '#0A84FF',
            padding: spacing.md,
            borderRadius: 8,
            alignItems: 'center',
        },
        saveButtonText: {
            color: '#FFFFFF',
            fontSize: 17,
            fontWeight: '600',
        },
        disabledButton: {
            opacity: 0.6,
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
                <Text style={styles.title}>Edit Profile</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.avatarContainer}>
                    <Avatar.Image
                        size={100}
                        source={profileImage ? { uri: profileImage } : require('../../assets/default-avatar.png')}
                        style={styles.avatar}
                    />
                    <TouchableOpacity
                        style={styles.changePhotoButton}
                        onPress={handleImagePick}
                    >
                        <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Display Name</Text>
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

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            (loading || !formData.displayName.trim()) && styles.disabledButton,
                        ]}
                        onPress={handleSave}
                        disabled={loading || !formData.displayName.trim()}
                    >
                        <Text style={styles.saveButtonText}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditProfileScreen; 