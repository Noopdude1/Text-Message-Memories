import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigationParams } from '../../types';
import { useCart } from '../../context/CartContext';
import TopBar from '../../components/TopBar';
import { CardField, StripeProvider } from '@stripe/stripe-react-native';
import { LockIcon, ShoppingCartIcon } from '../../Assets/Icons';

type CheckoutScreenNavigationProp = NativeStackNavigationProp<NavigationParams, 'Checkout'>;

const STRIPE_PUBLISHABLE_KEY = 'your_publishable_key_here';

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const { cartItems, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0).toFixed(2);

  const handlePayment = () => {
    if (!cardDetails?.complete) {
      Alert.alert('Incomplete Details', 'Please fill in the complete card details.', [
        { text: 'OK', style: 'default' },
      ]);
      return;
    }

    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Payment Successful', 'Your order has been processed successfully!', [
        {
          text: 'Continue',
          onPress: () => {
            clearCart();
            navigation.navigate('Home');
          },
          style: 'default',
        },
      ]);
    }, 2000);
  };

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <SafeAreaView style={styles.safeArea}>
        <TopBar title="Checkout" currentStep={4} totalSteps={5} />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <ShoppingCartIcon size={24} color="#4285F4" />
              <Text style={styles.sectionTitle}>Order Summary</Text>
            </View>
            {cartItems.map((item, index) => (
              <View key={item.id} style={styles.orderItem}>
                {item.coverImage ? (
                  <Image
                    source={{ uri: item.coverImage }}
                    style={styles.orderItemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.orderItemImage, styles.placeholderImage]} />
                )}
                <View style={styles.orderItemDetails}>
                  <Text style={styles.orderItemTitle}>{item.title}</Text>
                </View>
                <Text style={styles.orderItemPrice}>${item.price.toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total Amount</Text>
              <Text style={styles.totalPrice}>${totalPrice}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <LockIcon size={24} color="#4285F4" />
              <Text style={styles.sectionTitle}>Payment Details</Text>
            </View>
            <CardField
              postalCodeEnabled={true}
              placeholders={{
                number: '4242 4242 4242 4242',
              }}
              cardStyle={{
                backgroundColor: '#333333',
                textColor: '#FFFFFF',
                textErrorColor: '#FF4444',
                placeholderColor: '#888888',
                borderWidth: 0,
                borderRadius: 8,
              }}
              style={styles.cardField}
              onCardChange={setCardDetails}
            />
          </View>
        </ScrollView>

        <View style={styles.bottomBarContainer}>
          <TouchableOpacity
            style={[styles.payButton, loading && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <LockIcon size={20} color="#FFF" style={styles.buttonIcon} />
                <Text style={styles.payButtonText}>Pay ${totalPrice}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#1A1A1A',
    marginLeft: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderItemImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 12,
  },
  placeholderImage: {
    backgroundColor: '#F1F5F9',
  },
  orderItemDetails: {
    flex: 1,
    marginRight: 12,
  },
  orderItemTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'Poppins-Medium',
  },
  orderItemPrice: {
    fontSize: 16,
    color: '#4285F4',
    fontFamily: 'Poppins-SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    color: '#1A1A1A',
    fontFamily: 'Poppins-Medium',
  },
  totalPrice: {
    fontSize: 24,
    color: '#4285F4',
    fontFamily: 'Poppins-Bold',
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 8,
  },
  bottomBarContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: 16,
    paddingVertical: 16,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default CheckoutScreen;

