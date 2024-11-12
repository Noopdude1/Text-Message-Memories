import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {  NavigationParams } from '../../types';
import { formatDate } from '../../utils/dateFormatter';
import TopBar from '../../components/TopBar';
import BottomBar from '../../components/BottomBar';
import LoadingComponent from '../../components/LoadingComponent';
import ErrorComponent from '../../components/ErrorComponent';
import { MessagesIcon, ImagesIcon } from '../../Assets/Icons';
import { Conversation, fetchContacts, fetchConversations } from '../../utils/messagesHelper';

type ConversationsScreenNavigationProp = NativeStackNavigationProp<NavigationParams, 'Conversations'>;

const ConversationsScreen: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contactMap, setContactMap] = useState<Record<string, string>>({});
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<ConversationsScreenNavigationProp>();

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [conversationsData, contactsData] = await Promise.all([fetchConversations(), fetchContacts()]);
      setConversations(conversationsData);
      setContactMap(contactsData);
    } catch (err) {
      console.error(err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleSelectConversation = useCallback((address: string) => {
    setSelectedConversation(address);
  }, []);

  const keyExtractor = useCallback((item: Conversation) => item.address, []);

  const renderConversationItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConversationItem
        item={item}
        selected={selectedConversation === item.navigationAddress}
        onSelect={handleSelectConversation}
        contactMap={contactMap}
      />
    ),
    [selectedConversation, handleSelectConversation, contactMap]
  );

  if (error) {
    return <ErrorComponent message={error} onRetry={loadConversations} />;
  }

  return (
    <View style={styles.container}>
      {loading && <LoadingComponent message="Loading conversations..." />}
      <TopBar title="Text Story Creator" currentStep={1} totalSteps={4} />
      <View style={styles.outerContainer}>
        <View style={styles.innerContainer}>
          <Text style={styles.subtitle}>Select Conversation</Text>
          <FlatList
            data={conversations}
            keyExtractor={keyExtractor}
            renderItem={renderConversationItem}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
      <BottomBar
        currentStep={1}
        totalSteps={4}
        onNext={() => {
          if (selectedConversation) {
            navigation.navigate('ConversationDetails', { address: selectedConversation });
          }
        }}
        onBack={() => navigation.goBack()}
        isNextEnabled={!!selectedConversation}
      />
    </View>
  );
};

const ConversationItem: React.FC<{
  item: Conversation;
  selected: boolean;
  onSelect: (address: string) => void;
  contactMap: Record<string, string>;
}> = React.memo(({ item, selected, onSelect, contactMap }) => {
  const latestMessage = item.messages[item.messages.length - 1];
  const formattedDate = formatDate(latestMessage.date);
  const messageCount = item.messages.length;
  const normalizedAddress = item.address;
  const contactName = contactMap[normalizedAddress] || item.navigationAddress;

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selectedCard]}
      onPress={() => onSelect(item.navigationAddress)}
    >
      <View style={styles.leftContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{contactName.charAt(0).toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.address} numberOfLines={1}>{contactName}</Text>
        <Text style={styles.messagePreview} numberOfLines={1}>
          Last message: {formattedDate}
        </Text>
        <View style={styles.metaDataContainer}>
          <MessagesIcon size={16} color="#999" style={{ marginRight: 5 }} />
          <Text style={styles.metaData}>{messageCount} messages</Text>
          <ImagesIcon size={16} color="#999" style={{ marginRight: 5 }} />
          <Text style={styles.metaData}>0 images</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  outerContainer: {
    flex: 1,
    marginVertical: 20,
    backgroundColor: '#f7f7f7',
  },
  innerContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  listContent: {
    paddingBottom: 16,
    gap: 5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 16,

    paddingBottom: 25,
    paddingTop: 15,
    fontFamily: 'Poppins-Medium',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCard: {
    borderColor: '#0066FF',
    backgroundColor: '#f0f8ff',
  },
  leftContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins-Bold',
  },
  textContainer: {
    flex: 1,
  },
  address: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Poppins-Medium',
  },
  messagePreview: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  metaDataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaData: {
    fontSize: 12,
    color: '#999',
    marginRight: 12,
    fontFamily: 'Poppins-Regular',
  },
  rightContainer: {
    marginLeft: 12,
  },
});

export default ConversationsScreen;
