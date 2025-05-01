import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { UserProvider } from './contexts/UserContext';
import { DocumentProvider } from './contexts/DocumentContext';
import { StorageProvider } from './contexts/StorageContext';
import AppNavigator from './navigation/AppNavigator';
import { lightTheme } from './theme/theme';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={lightTheme}>
        <UserProvider>
          <DocumentProvider>
            <StorageProvider>
              <AppNavigator />
            </StorageProvider>
          </DocumentProvider>
        </UserProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
