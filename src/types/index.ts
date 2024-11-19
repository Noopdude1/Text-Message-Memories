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
  navigationAddress: string;
}

export interface StoryPart {
  id: string;
  type: 'text' | 'image';
  content?: string;
  uri?: string;
}

export interface NavigationParams extends ParamListBase {
  Conversations: undefined;
  ConversationDetails: { address: string };
  Login: undefined;
  StoryEditor: { prompt: string, messages: SMSMessage[] };
  Preview: {
    storyParts: StoryPart[];
  };
}
