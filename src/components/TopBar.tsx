import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigationParams } from '../types';
import useGoogleAuth from '../hooks/useGoogleAuth';
import { ShoppingCartIcon } from '../Assets/Icons';

type TopBarProps = {
  title: string;
  currentStep: number;
  totalSteps: number;
};

type TopBarNavigationProp = NativeStackNavigationProp<NavigationParams, 'Conversations'>;

const TopBar: React.FC<TopBarProps> = ({ title, currentStep, totalSteps }) => {
  const { user, signOut } = useGoogleAuth();
  const navigation = useNavigation<TopBarNavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigation.navigate('Login');
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        {/* First Row: Title and Cart Button */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.rightContainer}>
            <TouchableOpacity style={styles.cartButton}>
              <ShoppingCartIcon size={16} color="#000000"  style={{marginRight: 5}} />
              <Text style={styles.cartText}>Cart (0)</Text>
            </TouchableOpacity>
            {user && (
              <TouchableOpacity onPress={toggleModal} style={styles.avatarButton}>
                <Image
                  source={{ uri: user.photoURL || 'https://placekitten.com/40/40' }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Second Row: Step Indicators */}
        <View style={styles.progressRow}>
          <View style={styles.stepsContainer}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <View key={index} style={styles.stepWrapper}>
                <View
                  style={[
                    styles.stepCircle,
                    index + 1 <= currentStep ? styles.activeStep : styles.inactiveStep,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      index + 1 <= currentStep ? styles.activeStepNumber : styles.inactiveStepNumber,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                {index < totalSteps - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      index + 1 < currentStep ? styles.activeStepLine : styles.inactiveStepLine,
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Modal for User Info and Sign Out */}
        {user && modalVisible && (
          <Modal transparent={true} visible={modalVisible} animationType="fade">
            <TouchableOpacity style={styles.modalOverlay} onPress={toggleModal}>
              <View style={styles.modalContent}>
                <Image source={{ uri: user.photoURL || 'https://placekitten.com/40/40' }} style={styles.modalAvatar} />
                <Text style={styles.userName}>{user.displayName}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
                  <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    paddingTop: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Poppins-Bold',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    marginRight: 10,
  },
  cartIcon: {
    fontSize: 18,
    color: '#000',
    marginRight: 5,
  },
  cartText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: 700,
    fontFamily: 'Poppins-Regular',
  },
  avatarButton: {
    marginLeft: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 18,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: '#4285F4',
  },
  inactiveStep: {
    backgroundColor: '#E8EAF6',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  activeStepNumber: {
    color: '#FFFFFF',
  },
  inactiveStepNumber: {
    color: '#9AA0A6',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 4,
  },
  activeStepLine: {
    backgroundColor: '#4285F4',
  },
  inactiveStepLine: {
    backgroundColor: '#E8EAF6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 200,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Poppins-Medium',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  signOutButton: {
    marginTop: 12,
    backgroundColor: '#EA4335',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  signOutText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
});

export default TopBar;
