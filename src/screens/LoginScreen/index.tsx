import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import useGoogleAuth from '../../hooks/useGoogleAuth';
import Button from '../../components/Button';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { NavigationParams } from '../../types';

type LoginScreenNavigationProp = NativeStackNavigationProp<NavigationParams, 'Login'>;

const LoginScreen: React.FC = () => {
  const { signInWithGoogle, user, isLoading } = useGoogleAuth();
  const navigation = useNavigation<LoginScreenNavigationProp>();

  useEffect(() => {
    if (user) {
      navigation.navigate('Conversations');
    }
  }, [user, navigation]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigation.navigate('Conversations');
    } catch (error) {
      Alert.alert('Authentication Failed', 'Could not sign in with Google.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Text Tale</Text>
      <Button title="Sign in with Google" loading={isLoading} onPress={handleGoogleSignIn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: "Poppins-Bold"
  },
});

export default LoginScreen;
