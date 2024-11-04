import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';
import { Conversation } from '../../types';
import { useNavigation } from '@react-navigation/native';

const ConversationsScreen: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    SmsAndroid.list(
      JSON.stringify({ box: 'inbox' }),
      (fail) => console.log('Failed to fetch SMS:', fail),
      (count, smsList) => {
        const messages: Conversation[] = JSON.parse(smsList).reduce((acc, sms) => {
          const conversation = acc.find((c) => c.address === sms.address);
          if (conversation) {
            conversation.messages.push(sms);
          } else {
            acc.push({ address: sms.address, messages: [sms] });
          }
          return acc;
        }, []);
        setConversations(messages);
      }
    );
  }, []);

  const openConversation = (address: string) => {
    navigation.navigate('ConversationDetails', { address });
  };

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.address}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => openConversation(item.address)}>
          <Text style={styles.conversation}>{item.address}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  conversation: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default ConversationsScreen;
