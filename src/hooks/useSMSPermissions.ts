import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

export const useSMSPermissions = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const requestPermission = async () => {
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
      }
    };
    requestPermission();
  }, []);

  return permissionGranted;
};
