import {
  GoogleSignin,
  statusCodes,
  User as GoogleUser,
} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { useState, useEffect } from 'react';

enum GoogleSignInErrorEnum {
  DEVELOPER_ERROR = 'Invalid configuration. Please check your SHA-1 fingerprint and package name.',
  PLAY_SERVICES_NOT_AVAILABLE = 'Google Play Services not available or outdated',
  SIGN_IN_CANCELLED = 'Sign in cancelled by user',
  SIGN_IN_REQUIRED = 'Please sign in to continue',
  IN_PROGRESS = 'Sign in already in progress',
  NETWORK_ERROR = 'Network error occurred',
  INVALID_ACCOUNT = 'Invalid Google account selected',
}

interface GoogleSignInError extends Error {
  code: string;
  message: string;
}

const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<GoogleSignInError | null>(null);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '436319392807-5mccu66ndgij36epbis7aeh4ejdh5tni.apps.googleusercontent.com',
    });
  }, []);

  const checkPlayServices = async (): Promise<boolean> => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      return true;
    } catch (error: any) {
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error(GoogleSignInErrorEnum.PLAY_SERVICES_NOT_AVAILABLE);
      }
      return false;
    }
  };

  const handleSignInError = (error: any): GoogleSignInError => {
    console.error('Google Sign-In Error Details:', {
      code: error.code,
      message: error.message,
    });

    let errorMessage: string;
    switch (error.code) {
      case statusCodes.SIGN_IN_CANCELLED:
        errorMessage = GoogleSignInErrorEnum.SIGN_IN_CANCELLED;
        break;
      case statusCodes.IN_PROGRESS:
        errorMessage = GoogleSignInErrorEnum.IN_PROGRESS;
        break;
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        errorMessage = GoogleSignInErrorEnum.PLAY_SERVICES_NOT_AVAILABLE;
        break;
      case -1:
        errorMessage = GoogleSignInErrorEnum.NETWORK_ERROR;
        break;
      default:
        errorMessage = error.message || 'Unknown error occurred';
    }

    return {
      name: 'GoogleSignInError',
      code: error.code,
      message: errorMessage,
    } as GoogleSignInError;
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if Google Play Services is available
      const isPlayServicesAvailable = await checkPlayServices();
      if (!isPlayServicesAvailable) {
        throw new Error(GoogleSignInErrorEnum.PLAY_SERVICES_NOT_AVAILABLE);
      }

      // Sign the user in with Google and retrieve the ID token
      const signInResult = await GoogleSignin.signIn();

      // Try the new style of google-signin result, from v13+ of that module
      let idToken = signInResult?.data?.idToken;
      if (!idToken) {
        // If you are using older versions of google-signin, try old style result
        idToken = signInResult?.idToken!;
      }
      if (!idToken) {
        throw new Error('No ID token found');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);

      return userCredential.user;

    } catch (error: any) {
      const handledError = handleSignInError(error);
      setError(handledError);
      throw handledError;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await auth().signOut();
    } catch (error: any) {
      console.error('Google Sign-Out error:', error);
      setError({
        name: 'GoogleSignInError',
        code: 'SIGN_OUT_ERROR',
        message: 'Failed to sign out',
      } as GoogleSignInError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { signInWithGoogle, signOut, isLoading, error };
};

export default useGoogleAuth;
