import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import useGoogleAuth from '../hooks/useGoogleAuth';
import ConversationDetailsScreen from '../screens/ConversationDetails';
import ConversationsScreen from '../screens/Conversations';
import LoginScreen from '../screens/LoginScreen';
import StoryEditorScreen from '../screens/StoryEditor';
import PreviewScreen from '../screens/Preview';

import { NavigationParams } from '../types';
import CartScreen from '../screens/Cart';
import CheckoutScreen from '../screens/Checkout';

const Stack = createNativeStackNavigator<NavigationParams>();

const AppNavigator: React.FC = () => {
  const { user } = useGoogleAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? 'Conversations' : 'Login'}>
        <Stack.Screen
          name="Conversations"
          component={ConversationsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ConversationDetails"
          component={ConversationDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="StoryEditor"
          component={StoryEditorScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Preview"
          component={PreviewScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
