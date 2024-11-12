import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSMSPermissions } from './src/hooks/useSMSPermissions';
import useContacts from './src/hooks/useContacts';
import AppNavigator from './src/navigation';

const App: React.FC = () => {
  const {
    permissionGranted: smsPermissionGranted,
    error: smsError,
    retry: retrySMSPermission,
  } = useSMSPermissions();

  const {
    permissionGranted: contactsPermissionGranted,
    error: contactsError,
    retry: retryContactsPermission,
  } = useContacts();

  useEffect(() => {
    if (smsPermissionGranted && !contactsPermissionGranted) {
      retryContactsPermission();
    }
  }, [smsPermissionGranted, contactsPermissionGranted, retryContactsPermission]);

  useEffect(() => {
    if (contactsPermissionGranted && !smsPermissionGranted ) {
      retrySMSPermission();
    }
  }, [smsPermissionGranted, contactsPermissionGranted, retrySMSPermission]);

  if (!contactsPermissionGranted || !smsPermissionGranted) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Requesting permissions...</Text>
      </SafeAreaView>
    );
  }

  if (smsError || contactsError) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>{smsError || contactsError}</Text>
        <TouchableOpacity onPress={() => {
          if (smsError) retrySMSPermission();
          if (contactsError) retryContactsPermission();
        }} style={{ marginTop: 20 }}>
          <Text style={{ color: 'blue' }}>Retry Permissions</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      {smsPermissionGranted && contactsPermissionGranted ? (
        <AppNavigator />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, textAlign: 'center' }}>
            This app requires SMS and Contacts permissions to function. Please grant permissions to continue.
          </Text>
          <TouchableOpacity
            onPress={() => {
              retrySMSPermission();
              retryContactsPermission();
            }}
            style={{ marginTop: 20, padding: 10, backgroundColor: '#0066FF', borderRadius: 5 }}
          >
            <Text style={{ color: '#fff' }}>Grant Permissions</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default App;
