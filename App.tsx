import React from 'react';
import { SafeAreaView, StatusBar, Text } from 'react-native';
import AppNavigator from './src/navigation';
import { useSMSPermissions } from './src/hooks/useSMSPermissions';

const App: React.FC = () => {
  const hasPermission = useSMSPermissions();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      {hasPermission ? <AppNavigator /> : <Text>No SMS Permission</Text>}
    </SafeAreaView>
  );
};

export default App;
