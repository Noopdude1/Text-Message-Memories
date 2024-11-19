// src/screens/Preview/index.tsx

import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import TopBar from '../../components/TopBar';
import BottomBar from '../../components/BottomBar';
import { NavigationParams } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type PreviewScreenNavigationProp = NativeStackNavigationProp<
  NavigationParams,
  'Preview'
>;

interface PreviewScreenRouteParams {
  storyParts: StoryPart[];
}

interface StoryPart {
  id: string;
  type: 'text' | 'image';
  content?: string;
  uri?: string;
}

const PreviewScreen: React.FC = () => {
  const route = useRoute<RouteProp<{ params: PreviewScreenRouteParams }, 'params'>>();
  const navigation = useNavigation<PreviewScreenNavigationProp>();
  const { storyParts } = route.params;

  /**
   * Renders the story by mapping over the story parts.
   * Text parts are displayed as Text components.
   * Image parts are displayed as Image components.
   */
  const renderStory = () => {
    return storyParts.map((part) => {
      if (part.type === 'text') {
        return (
          <Text key={part.id} style={styles.storyText}>
            {part.content}
          </Text>
        );
      } else if (part.type === 'image') {
        return (
          <View key={part.id} style={styles.imageContainer}>
            {part.uri ? (
              <Image source={{ uri: part.uri }} style={styles.image} />
            ) : (
              <Text style={styles.errorText}>Image not available.</Text>
            )}
          </View>
        );
      } else {
        return null;
      }
    });
  };

  /**
   * Handles the next action (e.g., saving or sharing the story).
   */
  const handleNext = () => {
    // Proceed to the next step (e.g., save or share the story)
    Alert.alert('Story Completed', 'Your story is ready!');
  };

  return (
    <>
      <TopBar title="Preview Your Story" currentStep={4} totalSteps={5} />
      <ScrollView contentContainerStyle={styles.container}>
        {renderStory()}
      </ScrollView>
      <BottomBar
        currentStep={4}
        totalSteps={5}
        onNext={handleNext}
        onBack={() => navigation.goBack()}
        isNextEnabled={true}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  storyText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  imageContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
});

export default PreviewScreen;
