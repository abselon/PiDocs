import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import PersonalInformationScreen from '../screens/main/PersonalInformationScreen';
import SecurityScreen from '../screens/main/SecurityScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import BackupScreen from '../screens/main/BackupScreen';
import StorageUsageScreen from '../screens/main/StorageUsageScreen';
import CategoryScreen from '../screens/main/CategoryScreen';
import DocumentDetailsScreen from '../screens/main/DocumentDetailsScreen';
import AddDocumentScreen from '../screens/main/AddDocumentScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';

export type MainStackParamList = {
    Home: undefined;
    Profile: undefined;
    PersonalInformation: undefined;
    Security: undefined;
    Notifications: undefined;
    BackupScreen: undefined;
    StorageUsage: undefined;
    EditProfile: undefined;
    Categories: { category: string };
    DocumentDetails: { documentId: string };
    AddDocument: { categoryId?: string };
};

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} />
            <Stack.Screen name="Security" component={SecurityScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="BackupScreen" component={BackupScreen} />
            <Stack.Screen name="StorageUsage" component={StorageUsageScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Categories" component={CategoryScreen} />
            <Stack.Screen name="DocumentDetails" component={DocumentDetailsScreen} />
            <Stack.Screen name="AddDocument" component={AddDocumentScreen} />
        </Stack.Navigator>
    );
};

export default MainNavigator; 