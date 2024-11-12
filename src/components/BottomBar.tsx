import React from 'react';
import { View, StyleSheet } from 'react-native';
import Button from './Button';

type BottomBarProps = {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  isNextEnabled: boolean;
  loading?: boolean;
};

const BottomBar: React.FC<BottomBarProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  isNextEnabled,
  loading = false,
}) => {
  return (
    <View style={styles.container}>
      {currentStep > 1 && (
        <Button
          title="Back"
          onPress={onBack}
          style={styles.backButton}
          textStyle={styles.buttonText}
        />
      )}
      <View style={styles.spacer} />
      <View style={styles.stepIndicatorContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.stepIndicator,
              index + 1 <= currentStep ? styles.activeStep : styles.inactiveStep,
            ]}
          />
        ))}
      </View>
      <View style={styles.spacer} />
      {currentStep < totalSteps && (
        <Button
          title="Next"
          onPress={onNext}
          loading={loading}
          style={isNextEnabled ? styles.enabledNext : styles.disabledNext}
          textStyle={styles.buttonText}
          disabled={!isNextEnabled || loading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  backButton: {
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  enabledNext: {
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  disabledNext: {
    backgroundColor: '#aaa',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  spacer: {
    flex: 1,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeStep: {
    backgroundColor: '#0066FF',
  },
  inactiveStep: {
    backgroundColor: '#E0E0E0',
  },
});

export default BottomBar;
