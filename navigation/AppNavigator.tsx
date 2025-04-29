import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useUser } from '../contexts/UserContext';
import { RootStackParamList, AuthStackParamList } from './types';
import { lightTheme, darkTheme } from '../theme/theme';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/main/HomeScreen';
import AddDocumentScreen from '../screens/main/AddDocumentScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import DocumentDetailsScreen from '../screens/main/DocumentDetailsScreen';
import CategoryScreen from '../screens/main/CategoryScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import ScanIDScreen from '../screens/main/ScanIDScreen';
import BackupScreen from '../screens/main/BackupScreen';
import DocumentListScreen from '../screens/main/DocumentListScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Stack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
);

const AppNavigator: React.FC = () => {
    const { user } = useUser();
    const theme = user?.theme === 'dark' ? darkTheme : lightTheme;

    return (
        <NavigationContainer theme={theme}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: theme.colors.background }
                }}
            >
                {user ? (
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="AddDocument" component={AddDocumentScreen} />
                        <Stack.Screen name="DocumentDetail" component={DocumentDetailsScreen} />
                        <Stack.Screen name="Categories" component={CategoryScreen} />
                        <Stack.Screen name="ScanID" component={ScanIDScreen} />
                        <Stack.Screen name="Settings" component={SettingsScreen} />
                        <Stack.Screen name="Backup" component={BackupScreen} />
                        <Stack.Screen name="BrowseDocs" component={DocumentListScreen} />
                        <Stack.Screen name="Profile" component={ProfileScreen} />
                    </>
                ) : (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator; 