import { PermissionsAndroid, Platform } from 'react-native';
import Contacts from 'react-native-contacts';
import { Contact } from 'react-native-contacts/type';
import SmsAndroid, { SMS } from 'react-native-get-sms-android';

/**
 * Represents a conversation consisting of an address and its associated messages.
 */
export interface Conversation {
  address: string;
  messages: SMS[];
  navigationAddress: string;
}

/**
 * Request permission to access contacts.
 * @returns {Promise<boolean>} - Returns true if permission is granted, false otherwise.
 */
export async function requestContactsPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        title: 'Contacts Permission',
        message: 'This app requires access to your contacts.',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } else if (Platform.OS === 'ios') {
    const permission = await Contacts.checkPermission();
    if (permission === 'undefined') {
      const newPermission = await Contacts.requestPermission();
      return newPermission === 'authorized';
    }
    return permission === 'authorized';
  }
  return false;
}

/**
 * Normalize a phone number by removing non-digit characters and the first three digits (country code).
 * @param {string} phoneNumber - The phone number to normalize.
 * @returns {string} - The normalized phone number.
 */
export function normalizePhoneNumber(phoneNumber: string): string {
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  return digitsOnly.length > 3 ? digitsOnly.slice(3) : digitsOnly;
}

/**
 * Fetch all contacts and create a map of normalized phone numbers to contact names.
 * @returns {Promise<Record<string, string>>} - A map of normalized phone numbers to contact names.
 */
export async function fetchContacts(): Promise<Record<string, string>> {
  const permissionGranted = await requestContactsPermission();
  if (!permissionGranted) {
    throw new Error('Contacts permission denied');
  }

  try {
    const contacts: Contact[] = await Contacts.getAll();
    const contactMap: Record<string, string> = {};

    contacts.forEach((contact) => {
      const { phoneNumbers, displayName, givenName } = contact;
      phoneNumbers.forEach((phone) => {
        const normalizedNumber = normalizePhoneNumber(phone.number);
        if (normalizedNumber) {
          contactMap[normalizedNumber] = displayName || givenName || phone.number || 'Unknown';
        }
      });
    });

    return contactMap;
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    throw error;
  }
}

/**
 * Request permission to access SMS messages.
 * @returns {Promise<boolean>} - Returns true if permission is granted, false otherwise.
 */
export async function requestSmsPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SMS Permission',
        message: 'This app requires access to your SMS messages.',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return false;
}

/**
 * Fetch SMS messages from a specified box ('inbox' or 'sent').
 * @param {'inbox' | 'sent'} box - The SMS box to fetch messages from.
 * @returns {Promise<SMS[]>} - An array of SMS messages.
 */
export function fetchMessages(box: 'inbox' | 'sent'): Promise<SMS[]> {
  return new Promise((resolve, reject) => {
    SmsAndroid.list(
      JSON.stringify({ box }),
      (fail: string) => reject(fail),
      (count: number, smsList: string) => resolve(JSON.parse(smsList))
    );
  });
}

/**
 * Fetch and group SMS messages into conversations.
 * @returns {Promise<Conversation[]>} - An array of conversations, each containing an address and sorted messages.
 */
export async function fetchConversations(): Promise<Conversation[]> {
  const permissionGranted = await requestSmsPermission();
  if (!permissionGranted) {
    throw new Error('SMS permission denied');
  }

  try {
    const [inboxMessages, sentMessages] = await Promise.all([
      fetchMessages('inbox'),
      fetchMessages('sent'),
    ]);

    const allMessages = [...inboxMessages, ...sentMessages];
    const groupedConversations = allMessages.reduce<Record<string, Conversation>>((acc, sms) => {
      const address = normalizePhoneNumber(sms.address);
      if (!acc[address]) acc[address] = { address, navigationAddress: sms.address, messages: [] };
      acc[address].messages.push(sms);
      return acc;
    }, {});

    const conversationsArray = Object.values(groupedConversations).map((conversation) => ({
      ...conversation,
      messages: conversation.messages.sort((a, b) => b.date - a.date),
    }));

    return conversationsArray;
  } catch (error) {
    console.error('Failed to fetch SMS:', error);
    throw error;
  }
}
