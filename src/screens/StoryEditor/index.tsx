import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { launchImageLibrary } from 'react-native-image-picker';
import { CheckIcon, DustbinIcon, HamburgerIcon, PlusIcon } from '../../Assets/Icons';
import BottomBar from '../../components/BottomBar';
import TopBar from '../../components/TopBar';
import StoryEditorSkeleton from '../../components/StoryEditorSkeleton';
import { NavigationParams, SMSMessage } from '../../types';
import { generateStory } from '../../utils/openAiHelper';

const IMAGE_SIZE = 100;

interface StoryPart {
  id: string;
  type: 'text' | 'image' | 'heading' | 'blank';
  content?: string;
  uri?: string;
}

type StoryEditorScreenNavigationProp = NativeStackNavigationProp<
  NavigationParams,
  'StoryEditor'
>;

interface StoryEditorScreenRouteParams {
  prompt: string;
  messages: SMSMessage[];
}

const StoryEditorScreen: React.FC = () => {
  const route = useRoute<RouteProp<{ params: StoryEditorScreenRouteParams }, 'params'>>();
  const navigation = useNavigation<StoryEditorScreenNavigationProp>();
  const { prompt, messages } = route.params;

  const [storyParts, setStoryParts] = useState<StoryPart[]>([]);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [storyContent, setStoryContent] = useState('');

  useEffect(() => {
    if (!storyContent) return;

    const paragraphs: StoryPart[] = storyContent
      .split(/\n+/)
      .filter((line) => line.trim() !== '')
      .map((line, idx) => ({
        id: `${line.startsWith('##') ? 'heading' : 'text'}-${Date.now()}-${idx}`,
        type: line.startsWith('##') ? 'heading' : 'text',
        content: line.startsWith('##') ? line.replace(/^##\s*/, '').trim() : line.trim(),
      }));

    setStoryParts(paragraphs);
    setLoading(false);
  }, [storyContent]);

  useEffect(() => {
    const fetchStoryParts = async () => {
      setLoading(true);
      const story = await generateStory({ prompt, messages });
      setStoryContent(story || '');
    };

    fetchStoryParts();
  }, [prompt, messages]);

  const handleAddImage = useCallback(async () => {
    if (Platform.OS === 'android') {
      const permission =
        Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

      const hasPermission = await PermissionsAndroid.check(permission);
      if (!hasPermission) {
        const granted = await PermissionsAndroid.request(permission);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Denied',
            'Gallery access is required to select images.',
            [{ text: 'OK', style: 'default' }]
          );
          return;
        }
      }
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 5,
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.error('ImagePicker Error:', response.errorMessage);
          Alert.alert('Error', response.errorMessage || 'Failed to pick image');
        } else if (response.assets && response.assets.length > 0) {
          const newImages = response.assets.map((asset) => asset.uri!).filter(Boolean);
          setCarouselImages((prev) => [...prev, ...newImages]);
        }
      }
    );
  }, []);

  const handleSelectImage = useCallback(
    (uri: string) => {
      if (!selectedImages.includes(uri)) {
        const newImagePart: StoryPart = {
          id: `image-${Date.now()}`,
          type: 'image',
          uri,
        };
        setStoryParts((prev) => [newImagePart, ...prev]);
        setSelectedImages((prev) => [...prev, uri]);
      }
    },
    [selectedImages]
  );

  const handleDeleteImage = useCallback(
    (id: string) => {
      setStoryParts((prev) => prev.filter((part) => part.id !== id));
      const deletedPart = storyParts.find((part) => part.id === id);
      if (deletedPart?.uri) {
        setSelectedImages((prev) => prev.filter((uri) => uri !== deletedPart.uri));
      }
    },
    [storyParts]
  );

  const renderStoryPart = useCallback(
    ({ item, drag }: RenderItemParams<StoryPart>) => {
      if (item.type === 'text') {
        return (
          <View key={item.id} style={styles.textContainer}>
            <Text style={styles.storyText}>{item.content}</Text>
          </View>
        );
      } else if (item.type === 'heading') {
        return (
          <View key={item.id} style={styles.headingContainer}>
            <Text style={styles.headingText}>{item.content}</Text>
          </View>
        );
      } else {
        return (
          <View key={item.id} style={styles.imageContainer}>
            <TouchableOpacity style={styles.dragHandleContainer} onPressIn={drag}>
              <View style={styles.dragHandle}>
                <HamburgerIcon size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Image source={{ uri: item.uri }} style={styles.droppedImage} />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteImage(item.id)}
            >
              <DustbinIcon size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        );
      }
    },
    [handleDeleteImage]
  );

  if (loading) {
    return (
      <>
        <TopBar title="Text Story Creator" currentStep={3} totalSteps={5} />
        <StoryEditorSkeleton />
        <BottomBar
          currentStep={3}
          totalSteps={5}
          onNext={() => {}}
          onBack={() => navigation.goBack()}
          isNextEnabled={false}
        />
      </>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TopBar title="Edit Your Story" currentStep={3} totalSteps={5} />
        <View style={styles.carouselContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
            <TouchableOpacity onPress={handleAddImage} style={styles.addImagePlaceholder}>
              <PlusIcon size={30} color="#666" />
            </TouchableOpacity>
            {carouselImages.map((uri, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelectImage(uri)}
                style={styles.carouselImageContainer}
              >
                <Image source={{ uri }} style={styles.carouselImage} />
                {selectedImages.includes(uri) && (
                  <View style={styles.checkIconContainer}>
                    <CheckIcon size={40} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.listContainer}>
          <DraggableFlatList
            data={storyParts}
            onDragEnd={({ data }) => setStoryParts(data)}
            keyExtractor={(item) => item.id}
            renderItem={renderStoryPart}
            contentContainerStyle={styles.storyContentContainer}
          />
        </View>
        <BottomBar
          currentStep={3}
          totalSteps={5}
          onNext={() => navigation.navigate('Preview', { storyParts })}
          onBack={() => navigation.goBack()}
          isNextEnabled={true}
        />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  carouselContainer: {
    height: IMAGE_SIZE + 40,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 10,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  storyContentContainer: {
    paddingBottom: 16,
  },
  headingContainer: {
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EFEFEF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DADADA',
  },
  headingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    textTransform: 'uppercase',
    lineHeight: 28,
  },
  addImagePlaceholder: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  carouselImageContainer: {
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  carouselImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  checkIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -30 }],
    borderRadius: 20,
    padding: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  textContainer: {
    marginBottom: 16,
  },
  storyText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    position: 'relative',
  },
  droppedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF0000',
    borderRadius: 12,
    padding: 8,
  },
  dragHandleContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },
  dragHandle: {
    padding: 8,
  },
});

export default memo(StoryEditorScreen);
