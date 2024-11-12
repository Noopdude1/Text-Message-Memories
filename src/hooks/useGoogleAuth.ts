import {
  GoogleSignin,
  statusCodes,
  User as GoogleUser,
} from '@react-native-google-signin/google-signin';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

enum GoogleSignInErrorEnum {
  DEVELOPER_ERROR = 'Invalid configuration. Please check your SHA-1 fingerprint and package name.',
  PLAY_SERVICES_NOT_AVAILABLE = 'Google Play Services not available or outdated',
  SIGN_IN_CANCELLED = 'Sign in cancelled by user',
  SIGN_IN_REQUIRED = 'Please sign in to continue',
  IN_PROGRESS = 'Sign in already in progress',
  NETWORK_ERROR = 'Network error occurred',
  INVALID_ACCOUNT = 'Invalid Google account selected',
  SIGN_OUT_ERROR = 'Failed to sign out',
  NO_ID_TOKEN = 'No ID token found',
}

interface GoogleSignInError extends Error {
  code: string;
  message: string;
}

const PERSISTENCE_KEY = 'userAuthData';

const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<GoogleSignInError | null>(null);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '436319392807-5mccu66ndgij36epbis7aeh4ejdh5tni.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });

    loadUserData();
    checkUserStatus();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(PERSISTENCE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const persistUserData = async (userData: FirebaseAuthTypes.User) => {
    try {
      await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  };

  const clearUserData = async () => {
    try {
      await AsyncStorage.removeItem(PERSISTENCE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  };

  const checkUserStatus = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      setUser(currentUser);
    }
  };

  const checkPlayServices = async (): Promise<boolean> => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      return true;
    } catch (error: any) {
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error(GoogleSignInErrorEnum.PLAY_SERVICES_NOT_AVAILABLE);
      }
      return false;
    }
  };

  const handleSignInError = (error: any): GoogleSignInError => {
    console.error('Google Sign-In Error Details:', { code: error.code, message: error.message });

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
      case 'DEVELOPER_ERROR':
        errorMessage = GoogleSignInErrorEnum.DEVELOPER_ERROR;
        break;
      case -1:
        errorMessage = GoogleSignInErrorEnum.NETWORK_ERROR;
        break;
      default:
        errorMessage = error.message || 'Unknown error occurred';
    }

    return { name: 'GoogleSignInError', code: error.code, message: errorMessage } as GoogleSignInError;
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const isPlayServicesAvailable = await checkPlayServices();
      if (!isPlayServicesAvailable) {
        throw new Error(GoogleSignInErrorEnum.PLAY_SERVICES_NOT_AVAILABLE);
      }

      const signInResult = await GoogleSignin.signIn();
      let idToken = signInResult?.data?.idToken;
      if (!idToken) {
        throw new Error(GoogleSignInErrorEnum.NO_ID_TOKEN);
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);

      persistUserData(userCredential.user);
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
      await clearUserData();
    } catch (error: any) {
      console.error('Google Sign-Out error:', error);
      setError({
        name: 'GoogleSignInError',
        code: GoogleSignInErrorEnum.SIGN_OUT_ERROR,
        message: GoogleSignInErrorEnum.SIGN_OUT_ERROR,
      } as GoogleSignInError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { signInWithGoogle, signOut, isLoading, error, user };
};

export default useGoogleAuth;
