import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { NavigationParams } from '../../types';
import { useCart } from '../../context/CartContext';
import TopBar from '../../components/TopBar';
import { LockIcon, ShoppingCartIcon } from '../../Assets/Icons';
import useGoogleAuth from '../../hooks/useGoogleAuth';
import { createLuluPrintJob, LineItem } from '../../utils/luluApiHelper';

type CheckoutScreenNavigationProp = NativeStackNavigationProp<NavigationParams, 'Checkout'>;
type ShippingInfo = {
  name: string;
  company?: string;
  address1: string;
  address2?: string;
  address3?: string;
  city: string;
  state: string;
  postal: string;
  country: string;
  phone: string;
  email: string;
};

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Lv9jTLZIHEwj1YnoEXEOpwW65FA5SbqYXnlw1hX2dUM2OAKJVs5zOhbdgPz0cMFUC2KYSptcd6BNg3AfP9Tcr1b00UPCeMgbL';

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const { cartItems, clearCart } = useCart();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [paymentSheetLoaded, setPaymentSheetLoaded] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const { user } = useGoogleAuth();

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0).toFixed(2);

  useEffect(() => {
    initializePaymentSheet();
    loadShippingInfo();
  }, []);

  const loadShippingInfo = async () => {
    try {
      const storedShippingInfo = await AsyncStorage.getItem('shippingInfo');
      if (storedShippingInfo) {
        setShippingInfo(JSON.parse(storedShippingInfo));
      }
    } catch (error) {
      console.error('Failed to load shipping info:', error);
    }
  };

  const fetchPaymentSheetParams = async () => {
    try {
      const response = await fetch(
        'https://text-message-memories-backend.onrender.com/create-payment-intent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(Number(totalPrice) * 100),
            currency: 'usd',
          }),
        }
      );
      const { clientSecret } = await response.json();
      return { clientSecret };
    } catch (error) {
      console.error('Error fetching payment sheet params:', error);
      throw error;
    }
  };

  const initializePaymentSheet = async () => {
    try {
      const { clientSecret } = await fetchPaymentSheetParams();

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Story Book',
        paymentMethodOrder: ["card"],
        defaultBillingDetails: {
          name: user?.displayName || "",
          email: user?.email || "",
        },
      });

      if (!error) {
        setPaymentSheetLoaded(true);
      } else {
        Alert.alert('Error', error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize payment sheet.');
    }
  };

  const openPaymentSheet = async () => {
    if (!paymentSheetLoaded || !shippingInfo) {
      Alert.alert('Error', 'Shipping information or payment sheet not loaded.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert('Payment Failed', error.message);
        return;
      }

      try {
        await createOrder();

        Alert.alert('Success', 'Your payment and order were successful!', [
          {
            text: 'Continue',
            onPress: () => {
              clearCart();
              navigation.navigate('Conversations');
            },
          },
        ]);
      } catch (orderError) {
        console.error('Error during order creation:', orderError);
        Alert.alert('Order Creation Failed', 'Payment succeeded but order creation failed. Please contact support.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to complete the transaction.');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    try {
      if (!shippingInfo) {
        throw new Error('Missing shipping information.');
      }

      const lineItems: LineItem[] = cartItems.map((item) => ({
        external_id: item.id,
        title: item.title,
        quantity: 1,
        printable_normalization: {
          cover: { source_url: 'https://www.dropbox.com/scl/fi/5k9rbd9vjnykz06x7ltf2/1c7841d3-7ea2-40cd-b6bd-eedc922e3be9.pdf?rlkey=1vq2gr2hxhep4fvo7zmn9m7gx&st=zmt8mmca&dl=1&raw=1' },
          interior: { source_url: item.pdfPath },
          pod_package_id: '0425X0687FCPRESS060UW444GXX',
        },
      }));


      const response = await createLuluPrintJob(
        {
          city: shippingInfo.city,
          country_code: shippingInfo.country,
          name: shippingInfo.name,
          phone_number: shippingInfo.phone,
          postcode: shippingInfo.postal,
          state_code: shippingInfo.state,
          street1: shippingInfo.address1,
          email: user?.email || 'test@test.com',
        },
        lineItems
      );

      console.log('Lulu Print Job Created:', response);
      return response;
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Order Creation Failed', 'Could not create the print job. Please try again later.');
      throw error;
    }
  };

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <SafeAreaView style={styles.safeArea}>
        <TopBar title="Checkout" currentStep={5} totalSteps={5} />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Summary Card */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <ShoppingCartIcon size={24} color="#4285F4" />
              <Text style={styles.sectionTitle}>Order Summary</Text>
            </View>

            {cartItems.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <Text style={styles.orderItemTitle}>{item.title}</Text>
                <Text style={styles.orderItemPrice}>${item.price.toFixed(2)}</Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total Amount</Text>
              <Text style={styles.totalPrice}>${totalPrice}</Text>
            </View>
          </View>

        </ScrollView>

        <View style={styles.bottomBarContainer}>
          <TouchableOpacity
            style={[
              styles.payButton,
              (!paymentSheetLoaded || loading) && styles.payButtonDisabled
            ]}
            onPress={openPaymentSheet}
            disabled={!paymentSheetLoaded || loading}
          >
            {loading || !paymentSheetLoaded ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <LockIcon size={20} color="#FFFFFF" style={styles.buttonIcon} />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
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
    justifyContent: 'space-between',
    marginBottom: 16,
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
  bottomBarContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
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
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 5,
  },
  securePaymentContainer: {
    backgroundColor: '#F0F4F8',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  securePaymentText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  securePaymentSubtext: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
  },
});

export default CheckoutScreen;
