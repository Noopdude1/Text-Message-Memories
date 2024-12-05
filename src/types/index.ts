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
  type: 'text' | 'image' | 'heading';
  content?: string;
  uri?: string;
}

export interface CartItem {
  id: string;
  title: string;
  content: string;
  pdfPath: string;
  price: number;
  coverImage: string;
}

export interface NavigationParams extends ParamListBase {
  Conversations: undefined;
  ConversationDetails: { address: string };
  Login: undefined;
  StoryEditor: { prompt: string; messages: SMSMessage[] };
  Preview: {
    storyParts: StoryPart[];
  };
  Cart: undefined;
  Checkout: undefined;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
  client_secret: string;
}

