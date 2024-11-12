import { useEffect, useState } from 'react';
import Contacts from 'react-native-contacts';
import { Contact } from 'react-native-contacts/type';
import { PermissionsAndroid, Platform } from 'react-native';

export interface ContactMap {
  [key: string]: string;
}

interface UseContactsResult {
  contactMap: ContactMap;
  fetchContact: (phoneNumber: string) => void;
  loading: boolean;
  error: string | null;
  permissionGranted: boolean;
  retry: () => void;
}

const normalizePhoneNumber = (number: string): string => {
  const cleaned = number.replace(/[^0-9+]/g, '');
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};

const useContacts = (): UseContactsResult => {
  const [contactMap, setContactMap] = useState<ContactMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const checkAndRequestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
        title: 'Contacts Permission',
        message: 'This app requires access to your contacts to display names for conversations.',
        buttonPositive: 'OK',
      });
      setPermissionGranted(granted === PermissionsAndroid.RESULTS.GRANTED);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error('Contact permission denied');
      }
    } else {
      const permissionStatus = await Contacts.checkPermission();
      if (permissionStatus === 'authorized') {
        setPermissionGranted(true);
      } else {
        setPermissionGranted(false);
        throw new Error('Contact permission denied');
      }
    }
  };

  const fetchContact = async (phoneNumber: string) => {
    if (!permissionGranted) return;

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (contactMap[normalizedPhone]) return;

    setLoading(true);
    setError(null);

    try {
      const contacts = await Contacts.getContactsByPhoneNumber(normalizedPhone);
      const contact = contacts[0];
      if (contact) {
        setContactMap((prev) => ({
          ...prev,
          [normalizedPhone]: contact.displayName || contact.givenName || 'Unknown',
        }));
      }
    } catch (err) {
      setError('Failed to fetch contact.');
      console.error('useContacts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const retryContactsPermission = async () => {
    try {
      await checkAndRequestPermission();
    } catch (error) {
      console.error('Failed to request contact permissions:', error);
    }
  };

  useEffect(() => {
    checkAndRequestPermission();
  }, []);

  return {
    contactMap,
    fetchContact,
    loading,
    error,
    permissionGranted,
    retry:retryContactsPermission,
  };
};

export default useContacts;
