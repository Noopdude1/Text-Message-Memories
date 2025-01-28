import React, { useEffect, useState } from 'react';
import {
  RouteProp,
  useNavigation,
  useRoute
} from '@react-navigation/native';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';
import BottomBar from '../../components/BottomBar';
import ErrorComponent from '../../components/ErrorComponent';
import LoadingComponent from '../../components/LoadingComponent';
import TopBar from '../../components/TopBar';
import { NavigationParams, SMSMessage } from '../../types';
import { PROMPTS } from '../../utils/constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import useGoogleAuth from '../../hooks/useGoogleAuth';

interface RouteParams {
  address: string;
  contactName: string;
}

type ConversationDetailsScreenNavigationProp = NativeStackNavigationProp<
  NavigationParams,
  'ConversationDetails'
>;

const ConversationDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { address, contactName = "Person 2" } = route.params;
  const navigation = useNavigation<ConversationDetailsScreenNavigationProp>();

  const { user } = useGoogleAuth();
  const currentUserName = user?.displayName || "You";

  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(PROMPTS[0].title);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const fetchFromBox = (box: 'inbox' | 'sent') =>
          new Promise<SMSMessage[]>((resolve, reject) => {
            SmsAndroid.list(
              JSON.stringify({ box, address }),
              (fail) => reject(fail),
              (count, smsList) => resolve(JSON.parse(smsList))
            );
          });

        const [inboxMessages, sentMessages] = await Promise.all([
          fetchFromBox('inbox'),
          fetchFromBox('sent'),
        ]);

        const allMessages = [...inboxMessages, ...sentMessages].sort((a, b) => a.date - b.date);
        setMessages(allMessages);
      } catch (err) {
        console.error('Failed to fetch SMS:', err);
        setError('Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [address]);

  /**
   * Prepares the final prompt to send to the story generator.
   * For predefined prompts, [Person1] and [Person2] are replaced with the current user's
   * and the conversation partner's names. For a custom prompt that does not contain these tokens,
   * a header line is prepended.
   */
  const preparePromptWithNames = (rawPrompt: string): string => {
    const containsPlaceholders = /\[Person1\]/.test(rawPrompt) || /\[Person2\]/.test(rawPrompt);
    if (containsPlaceholders) {
      return rawPrompt
        .replace(/\[Person1\]/g, currentUserName)
        .replace(/\[Person2\]/g, contactName);
    } else {
      return `Conversation between ${currentUserName} and ${contactName}:\n\n${rawPrompt}`;
    }
  };

  const handleNext = async () => {
    const rawPrompt =
      PROMPTS.find((prompt) => prompt.title === selectedPrompt)?.details || customPrompt;
    if (!rawPrompt.trim()) {
      Alert.alert('Please select or enter a prompt');
      return;
    }
    const finalPrompt = preparePromptWithNames(rawPrompt);
    navigation.navigate('StoryEditor', { prompt: finalPrompt, messages });
  };

  const handlePromptSelection = (title: string) => {
    setSelectedPrompt(title);
    setCustomPrompt('');
  };

  if (loading) {
    return <LoadingComponent message="Fetching messages..." />;
  }

  if (error) {
    return <ErrorComponent message={error} onRetry={() => setLoading(true)} />;
  }

  return (
    <>
      <TopBar title="Text Story Creator" currentStep={2} totalSteps={5} />
      <View style={styles.container}>
        <Text style={styles.title}>Customize Your Story</Text>
        <ScrollView contentContainerStyle={styles.promptContainer} automaticallyAdjustKeyboardInsets>
          {PROMPTS.map((prompt) => (
            <TouchableOpacity
              key={prompt.title}
              style={[
                styles.promptCard,
                selectedPrompt === prompt.title && styles.selectedCard,
              ]}
              onPress={() => handlePromptSelection(prompt.title)}
            >
              <Text style={styles.promptTitle}>{prompt.title}</Text>
              <Text style={styles.promptDescription}>{prompt.description}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.customPromptContainer}>
            <Text style={styles.customPromptTitle}>Custom Prompt</Text>
            <TextInput
              style={styles.customPromptInput}
              placeholderTextColor="#999"
              placeholder="Write your own custom prompt for the story generation..."
              value={customPrompt}
              onChangeText={(text) => {
                setCustomPrompt(text);
                setSelectedPrompt(null);
              }}
              multiline
            />
          </View>
        </ScrollView>
      </View>
      <BottomBar
        currentStep={2}
        totalSteps={5}
        onNext={handleNext}
        onBack={() => navigation.goBack()}
        isNextEnabled={!!selectedPrompt || !!customPrompt.trim()}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  promptContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  promptCard: {
    width: '48%',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCard: {
    borderColor: '#0066FF',
    backgroundColor: '#f0f8ff',
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Poppins-Medium',
  },
  promptDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  customPromptContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 16,
  },
  customPromptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Poppins-Medium',
  },
  customPromptInput: {
    height: 80,
    fontSize: 14,
    color: '#333',
    borderRadius: 4,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 8,
    textAlignVertical: 'top',
    fontFamily: 'Poppins-Regular',
  },
});

export default ConversationDetailsScreen;
