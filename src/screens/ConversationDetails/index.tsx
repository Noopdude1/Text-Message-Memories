import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import SmsAndroid from 'react-native-get-sms-android';
import MessageCard from '../../components/MessageCard';
import { SMSMessage } from '../../types';

interface RouteParams {
  address: string;
}

const ConversationDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { address } = route.params;
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = () => {
      SmsAndroid.list(
        JSON.stringify({
          box: 'inbox',
          address,
        }),
        (fail) => {
          console.log('Failed to fetch SMS:', fail);
          setError('Failed to fetch messages');
          setLoading(false);
        },
        (count, smsList) => {
          const smsMessages: SMSMessage[] = JSON.parse(smsList);
          setMessages(smsMessages);
          setLoading(false);
        }
      );
    };

    fetchMessages();
  }, [address]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item._id.toString()}
      renderItem={({ item }) => <MessageCard message={item} />}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default ConversationDetailsScreen;
