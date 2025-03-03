import React from 'react';
import { SafeAreaView, StatusBar, Text, View, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation';
import { usePermissions } from './src/hooks/useSMSPermissions';
import { CartProvider } from './src/context/CartContext';
import UserAgreement from './src/components/UserAgreement';
import { useAgreement } from './src/hooks/useAgreement';

const App: React.FC = () => {
  const { hasAgreed, loading: agreementLoading, handleAgree, handleExit } = useAgreement();
  const { permissionGranted, loading: permissionsLoading, error, retry } = usePermissions();

  if (agreementLoading || permissionsLoading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.statusText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!hasAgreed) {
    return (
      <SafeAreaView style={styles.fullScreenContainer}>
        <UserAgreement onAgree={handleAgree} onExit={handleExit} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={retry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry Permissions</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!permissionGranted) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text style={styles.permissionText}>
          This app requires SMS and Contacts permissions to function. Please grant permissions to continue.
        </Text>
        <TouchableOpacity onPress={retry} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <CartProvider>
      <SafeAreaView style={styles.fullScreenContainer}>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </SafeAreaView>
    </CartProvider>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreenContainer: {
    flex: 1,
  },
  statusText: {
    marginTop: 16,
    fontSize: 18,
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#0066FF',
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
  },
  permissionButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#0066FF',
    borderRadius: 5,
  },
  permissionButtonText: {
    color: '#fff',
  },
});

export default App;
