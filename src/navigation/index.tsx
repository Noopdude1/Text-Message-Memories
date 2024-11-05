import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import ConversationsScreen from '../screens/Conversations';
import ConversationDetailsScreen from '../screens/ConversationDetails';

const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Conversations" component={ConversationsScreen} />
      <Stack.Screen name="ConversationDetails" component={ConversationDetailsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
