import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, Text } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AppNavigator from './src/navigation';
import LoginScreen from './src/screens/LoginScreen';
import { useSMSPermissions } from './src/hooks/useSMSPermissions';

const App: React.FC = () => {
  const [user, setUser] = useState(null);
  const hasPermission = useSMSPermissions();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Replace with your Web Client ID from Firebase
    });

    const unsubscribe = auth().onAuthStateChanged((authUser) => {
      setUser(authUser);
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      {hasPermission ? (
        user ? (
          <AppNavigator />
        ) : (
          <LoginScreen />
        )
      ) : (
        <Text>No SMS Permission</Text>
      )}
    </SafeAreaView>
  );
};

export default App;
