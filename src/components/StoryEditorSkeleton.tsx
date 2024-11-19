import React, { useEffect } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View } from 'react-native';
import Card from './Card';

const IMAGE_SIZE = 100;


const SkeletonPulse = () => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  return (
    <Animated.View style={[styles.pulseContainer, { opacity, transform: [{ scale }, { translateY }, { rotate }] }]}>
      <View style={styles.pulse} />
    </Animated.View>
  );
};

const ImageGallerySkeleton = () => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryContainer}>
    {[1, 2, 3, 4].map((key) => (
      <View key={key} style={styles.imageSkeleton}>
        <SkeletonPulse />
      </View>
    ))}
  </ScrollView>
);

const ContentBlockSkeleton = () => (
  <View style={styles.blockContainer}>
    {[1, 2, 3].map((key) => (
      <View key={key} style={styles.textBlock}>
        <SkeletonPulse />
      </View>
    ))}
  </View>
);

const CarouselSkeleton = () => (
  <View style={styles.carouselContainer}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
      {[1, 2, 3, 4].map((key) => (
        <View key={key} style={styles.carouselImageSkeleton}>
          <SkeletonPulse />
        </View>
      ))}
    </ScrollView>
  </View>
);

const StoryPartSkeleton = () => (
  <View style={styles.listContainer}>
    {[1, 2, 3].map((key) => (
      <View key={key} style={styles.storyPartSkeleton}>
        <SkeletonPulse />
      </View>
    ))}
  </View>
);

export default function StoryEditorSkeleton() {
  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <CarouselSkeleton />
        <StoryPartSkeleton />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  galleryContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  imageSkeleton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  blockContainer: {
    padding: 16,
  },
  textBlock: {
    height: 120,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  pulseContainer: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
  },
  pulse: {
    flex: 1,
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
  },
  carouselContainer: {
    height: IMAGE_SIZE + 40,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 10,
  },
  carouselImageSkeleton: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    marginHorizontal: 5,
    overflow: 'hidden',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  storyPartSkeleton: {
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
});
