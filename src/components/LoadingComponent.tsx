import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, useColorScheme } from 'react-native';

interface LoadingComponentProps {
  message?: string;
}

const BeautifiedLoadingComponent: React.FC<LoadingComponentProps> = ({ message = "Loading..." }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const colorScheme = useColorScheme();

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel([spinAnimation, pulseAnimation]).start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, [spinValue, scaleValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const isDarkMode = colorScheme === 'dark';

  return (
    <View style={[styles.overlay, isDarkMode && styles.overlayDark]}>
      <View style={[styles.loaderContainer, isDarkMode && styles.loaderContainerDark]}>
        <Animated.View
          style={[
            styles.spinner,
            isDarkMode && styles.spinnerDark,
            {
              transform: [
                { rotate: spin },
                { scale: scaleValue },
              ],
            },
          ]}
        />
        {message && (
          <Text
            style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}
            accessibilityLiveRegion="polite"
          >
            {message}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  loaderContainer: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loaderContainerDark: {
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
    shadowColor: "#FFF",
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: 'rgba(52, 152, 219, 0.2)',
    borderTopColor: '#3498db',
    borderRightColor: '#3498db',
  },
  spinnerDark: {
    borderColor: 'rgba(52, 152, 219, 0.2)',
    borderTopColor: '#5DADE2',
    borderRightColor: '#5DADE2',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
  loadingTextDark: {
    color: '#ECF0F1',
    fontFamily: 'Poppins-Medium',
  },
});

export default BeautifiedLoadingComponent;
