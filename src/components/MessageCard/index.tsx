import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SMSMessage } from '../../types';
import { formatDate } from '../../utils/dateFormatter';

interface MessageCardProps {
  message: SMSMessage;
}

const MessageCard: React.FC<MessageCardProps> = ({ message }) => (
  <View style={styles.container}>
    <Text style={styles.body}>{message.body}</Text>
    <Text style={styles.date}>{formatDate(message.date)}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  body: {
    fontSize: 16,
  },
  date: {
    fontSize: 12,
    color: 'gray',
  },
});

export default MessageCard;
