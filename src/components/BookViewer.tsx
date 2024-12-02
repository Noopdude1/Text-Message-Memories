import React, { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';
import { BlurView } from '@react-native-community/blur';

const { width, height } = Dimensions.get('window');
const BOOK_WIDTH = width * 0.9;
const BOOK_HEIGHT = height * 0.7;
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 90,
};

interface Page {
  id: number;
  content: string;
  image?: string;
}

interface BookViewerProps {
  pages: Page[];
  onPageChange?: (page: number) => void;
}

const BookPage: React.FC<{
  page: Page;
  pageNumber: number;
  isFlipping: boolean;
}> = ({ page, pageNumber, isFlipping }) => {
  return (
    <Animated.View style={[styles.page, isFlipping && styles.pageFlipping]}>
      <View style={styles.pageContent}>
        <Text style={styles.pageNumber}>{pageNumber}</Text>
        {page.image && (
          <Image
            source={{ uri: page.image }}
            style={styles.pageImage}
            resizeMode="cover"
          />
        )}
        <Text style={styles.pageText}>{page.content}</Text>
      </View>
      {Platform.OS === 'ios' && isFlipping && (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={3}
        />
      )}
    </Animated.View>
  );
};

const BookViewer: React.FC<BookViewerProps> = ({ pages, onPageChange }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const translateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    onPageChange?.(newPage);
  }, [onPageChange]);

  const resetAnimation = () => {
    translateX.value = withTiming(0);
    rotateY.value = withTiming(0);
    scale.value = withTiming(1);
    runOnJS(setIsFlipping)(false);
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
      runOnJS(setIsFlipping)(true);
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
      rotateY.value = interpolate(
        event.translationX,
        [-BOOK_WIDTH, 0, BOOK_WIDTH],
        [30, 0, -30],
        Extrapolate.CLAMP
      );
      scale.value = interpolate(
        Math.abs(event.translationX),
        [0, BOOK_WIDTH / 2],
        [1, 0.95],
        Extrapolate.CLAMP
      );
    },
    onEnd: (event) => {
      const shouldFlip = Math.abs(event.velocityX) > 500 ||
                        Math.abs(translateX.value) > BOOK_WIDTH / 3;

      if (shouldFlip) {
        if (event.velocityX < 0 && currentPage < pages.length - 1) {
          translateX.value = withSpring(-BOOK_WIDTH, SPRING_CONFIG, () => {
            runOnJS(handlePageChange)(currentPage + 1);
            runOnJS(resetAnimation)();
          });
        } else if (event.velocityX > 0 && currentPage > 0) {
          translateX.value = withSpring(BOOK_WIDTH, SPRING_CONFIG, () => {
            runOnJS(handlePageChange)(currentPage - 1);
            runOnJS(resetAnimation)();
          });
        } else {
          resetAnimation();
        }
      } else {
        resetAnimation();
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { perspective: 1000 },
      { rotateY: `${rotateY.value}deg` },
      { scale: scale.value },
    ],
  }));

  const renderShadow = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.abs(translateX.value),
      [0, BOOK_WIDTH / 2],
      [0, 0.3],
      Extrapolate.CLAMP
    ),
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.bookContainer}>
        <Animated.View style={[styles.shadowContainer, renderShadow]} />
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.book, animatedStyle]}>
            <BookPage
              page={pages[currentPage]}
              pageNumber={currentPage + 1}
              isFlipping={isFlipping}
            />
          </Animated.View>
        </PanGestureHandler>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, currentPage === 0 && styles.buttonDisabled]}
          onPress={() => currentPage > 0 && handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>

        <Text style={styles.pageIndicator}>
          {currentPage + 1} of {pages.length}
        </Text>

        <TouchableOpacity
          style={[styles.button, currentPage === pages.length - 1 && styles.buttonDisabled]}
          onPress={() => currentPage < pages.length - 1 && handlePageChange(currentPage + 1)}
          disabled={currentPage === pages.length - 1}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookContainer: {
    width: BOOK_WIDTH,
    height: BOOK_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  book: {
    width: BOOK_WIDTH,
    height: BOOK_HEIGHT,
    backgroundColor: '#f8f5e6',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  shadowContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    borderRadius: 10,
  },
  page: {
    flex: 1,
    backgroundColor: '#f8f5e6',
    borderRadius: 10,
    padding: 20,
    overflow: 'hidden',
  },
  pageFlipping: {
    backfaceVisibility: 'hidden',
  },
  pageContent: {
    flex: 1,
  },
  pageImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 5,
  },
  pageText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    fontSize: 12,
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: BOOK_WIDTH,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#8b7355',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pageIndicator: {
    fontSize: 16,
    color: '#666',
  },
});

export default BookViewer;
