import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import TopBar from '../../components/TopBar';
import BottomBar from '../../components/BottomBar';
import { generateImage } from '../../utils/openAiHelper';
import { NavigationParams } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DustbinIcon, RetryIcon } from '../../Assets/Icons';

type StoryEditorScreenNavigationProp = NativeStackNavigationProp<
  NavigationParams,
  'StoryEditor'
>;

interface StoryEditorScreenRouteParams {
  storyContent: string;
}

interface StoryPart {
  type: 'text' | 'image';
  content?: string;
  placeholder?: string;
}

const { width } = Dimensions.get('window');

const StoryEditorScreen: React.FC = () => {
  const route = useRoute<RouteProp<{ params: StoryEditorScreenRouteParams }, 'params'>>();
  const navigation = useNavigation<StoryEditorScreenNavigationProp>();
  const { storyContent } = route.params;

  const [storyParts, setStoryParts] = useState<StoryPart[]>([]);
  const [images, setImages] = useState<{ [key: string]: string }>({});
  const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!storyContent) return;

    /**
     * Processes the initial story content into parts (text and images).
     */
    const processStoryContent = () => {
      const parts = storyContent.split(/(\{\{.*?\}\})/g);
      const newStoryParts: StoryPart[] = [];

      parts.forEach((part) => {
        if (part.match(/\{\{.*?\}\}/)) {
          newStoryParts.push({ type: 'image', placeholder: part });
        } else {
          const paragraphs = part.split(/\n+/).filter((p) => p.trim() !== '');
          paragraphs.forEach((paragraph) => {
            newStoryParts.push({ type: 'text', content: paragraph });
          });
        }
      });

      setStoryParts(newStoryParts);
    };

    processStoryContent();
  }, [storyContent]);

  useEffect(() => {
    /**
     * Fetches images for the image placeholders concurrently using Promise.all.
     */
    const fetchImages = async () => {
      const imagePlaceholders = storyParts
        .filter((part) => part.type === 'image')
        .map((part) => part.placeholder!);

      const newImages = { ...images };
      const newLoadingImages = { ...loadingImages };

      const fetchImagePromises = imagePlaceholders.map(async (placeholder) => {
        const description = placeholder.replace('{{', '').replace('}}', '');
        if (!newImages[placeholder]) {
          newLoadingImages[placeholder] = true;
          setLoadingImages({ ...newLoadingImages });

          try {
            const imageUrl = await generateImage(description);
            newImages[placeholder] = imageUrl;
          } catch (error) {
            Alert.alert('Image Generation Error', `Failed to generate image for: ${description}`);
          } finally {
            newLoadingImages[placeholder] = false;
            setLoadingImages({ ...newLoadingImages });
          }
        }
      });

      await Promise.all(fetchImagePromises);
      setImages({ ...newImages });
    };

    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyParts]);

  /**
   * Regenerates an image for a given placeholder.
   * @param placeholder - The placeholder text for the image.
   */
  const handleRegenerateImage = async (placeholder: string) => {
    const description = placeholder.replace('{{', '').replace('}}', '');
    setLoadingImages((prev) => ({ ...prev, [placeholder]: true }));

    try {
      const imageUrl = await generateImage(description);
      setImages((prevImages) => ({
        ...prevImages,
        [placeholder]: imageUrl,
      }));
    } catch (error) {
      Alert.alert('Image Generation Error', `Failed to regenerate image for: ${description}`);
    } finally {
      setLoadingImages((prev) => ({ ...prev, [placeholder]: false }));
    }
  };

  /**
   * Removes an image at a specified index from the story parts.
   * @param index - The index of the image to remove.
   */
  const handleRemoveImage = (index: number) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newStoryParts = [...storyParts];
            const removedPart = newStoryParts.splice(index, 1)[0];
            setStoryParts(newStoryParts);

            if (removedPart.type === 'image' && removedPart.placeholder) {
              setImages((prevImages) => {
                const newImages = { ...prevImages };
                delete newImages[removedPart.placeholder!];
                return newImages;
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * Navigates to the Preview screen with the reconstructed story text and images.
   */
  const handleNext = () => {
    const reconstructedStoryText = storyParts
      .map((part) => (part.type === 'image' ? part.placeholder : part.content))
      .join('\n\n');

    navigation.navigate('Preview', { storyText: reconstructedStoryText, images });
  };

  /**
   * Renders the story parts (text inputs and images).
   */
  const renderStory = () => {
    return storyParts.map((part, index) => {
      if (part.type === 'image') {
        const placeholder = part.placeholder!;
        const imageUrl = images[placeholder];
        const isLoading = loadingImages[placeholder];
        return (
          <View key={index} style={styles.imageContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#4285F4" style={styles.loadingIndicator} />
            ) : imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.image} />
            ) : (
              <Text style={styles.errorText}>Failed to load image.</Text>
            )}
            <View style={styles.iconButtons}>
              <TouchableOpacity onPress={() => handleRegenerateImage(placeholder)}>
                <RetryIcon size={24} color="#4285F4" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRemoveImage(index)}>
                <DustbinIcon size={24} color="#EA4335" />
              </TouchableOpacity>
            </View>
          </View>
        );
      } else if (part.type === 'text') {
        return (
          <TextInput
            key={index}
            style={styles.storyText}
            multiline
            value={part.content}
            onChangeText={(text) => {
              const newStoryParts = [...storyParts];
              newStoryParts[index].content = text;
              setStoryParts(newStoryParts);
            }}
          />
        );
      } else {
        return null;
      }
    });
  };

  /**
   * Renders the image carousel at the top of the screen.
   */
  const renderImageCarousel = () => {
    const imageParts = storyParts.filter((part) => part.type === 'image');
    if (imageParts.length === 0) return null;

    return (
      <View style={styles.carouselContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {imageParts.map((part, index) => {
            const placeholder = part.placeholder!;
            const imageUrl = images[placeholder];
            const isLoading = loadingImages[placeholder];
            return (
              <View key={index} style={styles.carouselImageContainer}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#4285F4" />
                ) : imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.carouselImage} />
                ) : (
                  <Text style={styles.errorText}>Image not available.</Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <>
      <TopBar title="Edit Your Story" currentStep={3} totalSteps={5} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {renderImageCarousel()}
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {renderStory()}
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomBar
        currentStep={3}
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
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    backgroundColor: '#F9F9F9',
    paddingBottom: 16,
    flexGrow: 1,
  },
  storyText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    textAlignVertical: 'top',
    fontFamily: 'Poppins-Regular',
    minHeight: 80,
  },
  imageContainer: {
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  loadingIndicator: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  iconButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    width: '50%',
  },
  carouselContainer: {
    paddingVertical: 10,
    backgroundColor: '#F9F9F9',
  },
  carouselImageContainer: {
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
});

export default StoryEditorScreen;
