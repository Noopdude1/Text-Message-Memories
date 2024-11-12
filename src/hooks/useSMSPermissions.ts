import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

export const useSMSPermissions = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async () => {
    setLoading(true);
    setError(null);

    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          {
            title: 'SMS Permission',
            message: 'This app requires SMS access to display your messages.',
            buttonPositive: 'OK',
          }
        );
        setPermissionGranted(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setPermissionGranted(true);
      }
    } catch (err) {
      setError('Failed to request SMS permissions. Please try again.');
      console.error('Failed to request SMS permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  return { permissionGranted, loading, error, retry: requestPermission };
};
