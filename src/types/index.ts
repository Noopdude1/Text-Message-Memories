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

  export interface NavigationParams {
    Conversations: undefined;
    ConversationDetails: { address: string };
  }
