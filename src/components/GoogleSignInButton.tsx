import React from 'react';
import { Button } from 'react-native';

interface GoogleSignInButtonProps {
  onPress: () => void;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onPress }) => (
  <Button title="Sign in with Google" onPress={onPress} />
);

export default GoogleSignInButton;
