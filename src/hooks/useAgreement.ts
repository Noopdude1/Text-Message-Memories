import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHandler } from 'react-native';

const AGREEMENT_KEY = '@user_agreement_accepted';

export const useAgreement = () => {
  const [hasAgreed, setHasAgreed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAgreement();
  }, []);

  const checkAgreement = async () => {
    try {
      const value = await AsyncStorage.getItem(AGREEMENT_KEY);
      setHasAgreed(value === 'true');
    } catch (error) {
      console.error('Error checking agreement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgree = async () => {
    try {
      await AsyncStorage.setItem(AGREEMENT_KEY, 'true');
      setHasAgreed(true);
    } catch (error) {
      console.error('Error saving agreement:', error);
    }
  };

  const handleExit = () => {
    BackHandler.exitApp();
  };

  return {
    hasAgreed,
    loading,
    handleAgree,
    handleExit,
  };
};