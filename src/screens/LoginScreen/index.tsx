import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import useGoogleAuth from '../../hooks/useGoogleAuth';


const LoginScreen: React.FC = () => {
  const { signInWithGoogle } = useGoogleAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert('Authentication Failed', 'Could not sign in with Google.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SMS Reader</Text>
      <GoogleSignInButton onPress={handleGoogleSignIn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default LoginScreen;
