declare module 'react-native-get-sms-android' {
    export interface SMS {
      _id: string;
      address: string;
      body: string;
      date: number;
      read: number;
    }

    export interface Filter {
      box?: 'inbox' | 'sent';
      read?: number;
      indexFrom?: number;
      maxCount?: number;
    }

    export default class SmsAndroid {
      static list(
        filter: string,
        failureCallback: (error: string) => void,
        successCallback: (count: number, smsList: string) => void
      ): void;
    }
  }
