import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import useGoogleAuth from '../hooks/useGoogleAuth';
import ConversationDetailsScreen from '../screens/ConversationDetails';
import ConversationsScreen from '../screens/Conversations';
import LoginScreen from '../screens/LoginScreen';
import { NavigationParams } from '../types';

const Stack = createNativeStackNavigator<NavigationParams>();

const AppNavigator: React.FC = () => {
  const { user } = useGoogleAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? 'Conversations' : 'Login'}>
        <Stack.Screen name="Conversations" component={ConversationsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ConversationDetails" component={ConversationDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
