import React from 'react';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING = 16;
const CONTENT_WIDTH = SCREEN_WIDTH - (PADDING * 2);
const IMAGE_SIZE = 100;

const StoryEditorSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Image carousel skeleton */}
      <View style={styles.carouselContainer}>
        <ContentLoader
          speed={1}
          width={SCREEN_WIDTH}
          height={IMAGE_SIZE + 40}
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          {/* Add image placeholder */}
          <Rect x={PADDING} y={20} width={IMAGE_SIZE} height={IMAGE_SIZE} rx={8} />

          {/* Image thumbnails */}
          <Rect x={PADDING + IMAGE_SIZE + 10} y={20} width={IMAGE_SIZE} height={IMAGE_SIZE} rx={8} />
          <Rect x={PADDING + (IMAGE_SIZE * 2) + 20} y={20} width={IMAGE_SIZE} height={IMAGE_SIZE} rx={8} />
          <Rect x={PADDING + (IMAGE_SIZE * 3) + 30} y={20} width={IMAGE_SIZE} height={IMAGE_SIZE} rx={8} />
        </ContentLoader>
      </View>

      {/* Story content skeleton */}
      <View style={styles.contentContainer}>
        <ContentLoader
          speed={1}
          width={CONTENT_WIDTH}
          height={600}
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          {/* First paragraph */}
          <Rect x={0} y={0} width={CONTENT_WIDTH} height={100} rx={8} />

          {/* Image block */}
          <Rect x={0} y={120} width={CONTENT_WIDTH} height={200} rx={8} />

          {/* Second paragraph */}
          <Rect x={0} y={340} width={CONTENT_WIDTH} height={80} rx={8} />

          {/* Third paragraph */}
          <Rect x={0} y={440} width={CONTENT_WIDTH} height={120} rx={8} />
        </ContentLoader>
      </View>
    </View>
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
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: PADDING,
    paddingTop: 20,
  },
});

export default StoryEditorSkeleton;