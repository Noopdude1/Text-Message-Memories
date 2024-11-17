import React from 'react';
import { SafeAreaView, StatusBar, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import AppNavigator from './src/navigation';
import { usePermissions } from './src/hooks/useSMSPermissions';

const App: React.FC = () => {
  const { permissionGranted, loading, error, retry } = usePermissions();

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Requesting permissions...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>{error}</Text>
        <TouchableOpacity onPress={retry} style={{ marginTop: 20 }}>
          <Text style={{ color: 'blue' }}>Retry Permissions</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!permissionGranted) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, textAlign: 'center' }}>
          This app requires SMS and Contacts permissions to function. Please grant permissions to continue.
        </Text>
        <TouchableOpacity onPress={retry} style={{ marginTop: 20, padding: 10, backgroundColor: '#0066FF', borderRadius: 5 }}>
          <Text style={{ color: '#fff' }}>Grant Permissions</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </SafeAreaView>
  );
};

export default App;
