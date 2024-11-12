import { ParamListBase } from '@react-navigation/native';

export interface SMSMessage {
  _id: number;
  address: string;
  body: string;
  date: number;
  read: number;
}

export interface Conversation {
  address: string;
  messages: SMSMessage[];
}

// Extend ParamListBase to ensure compatibility with React Navigation
export interface NavigationParams extends ParamListBase {
  Conversations: undefined;
  ConversationDetails: { address: string };
  Login: undefined;
}
