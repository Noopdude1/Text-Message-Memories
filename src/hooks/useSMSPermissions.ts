import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';

export const usePermissions = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async () => {
    setLoading(true);
    setError(null);

    try {
      if (Platform.OS === 'android') {
        // Define permissions for contacts and SMS
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        ];

        // Request permissions
        const result = await PermissionsAndroid.requestMultiple(permissions);

        // Check if all permissions are granted
        const allPermissionsGranted = Object.values(result).every(
          (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allPermissionsGranted) {
          Alert.alert(
            'Permissions Required',
            'This app requires permissions for contacts and SMS to function properly. Please enable them in your device settings.',
            [
              {
                text: 'Open Settings',
                onPress: () => {
                  Linking.openSettings();
                }
              },
              { text: 'Cancel' }
            ]
          );
        }

        setPermissionGranted(allPermissionsGranted);
      } else {
        setPermissionGranted(true);
      }
    } catch (err) {
      setError('Failed to request permissions. Please try again.');
      console.error('Failed to request permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  return { permissionGranted, loading, error, retry: requestPermission };
};
