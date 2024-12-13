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
import axios from 'axios';


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
const auth_header = `Basic YXBpX2tleS1lOTgwNTlhZS0xMjQzLTRhNzgtYTU5OS03NmFkY2Q3NmEyYTg6c2VjcmV0LTRiMDNkNmNhLWQ3OGYtNGNlNC05NDQ5LTEzNGFlMzUwNTNkMg==`;

const BLURB_API_KEY = 'api_key-0aca72c9-9df1-4bf1-a631-271004d79bc0';
const BLURB_SHARED_SECRET = 'secret-dfde2935-459a-4ebe-b522-3a7779a9ccc6';

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
      if (!shippingInfo) return;

      const orderItems = cartItems.map((item) => ({
        sku: 'HCIW_12x12_MAT_GL100T', // Ensure this SKU is valid
        quantity: 1,
        retailPrice: item.price.toFixed(2),
        itemDescription: item.title,
        product: {
          coverUrl: 'https://docs.api.sandbox.rpiprint.com/pdfs/HCIW_12x12_MAT_GL100T_20pg_cover.pdf',
          gutsUrl: item.pdfPath, // Ensure this URL is valid
        },
      }));

      const orderPayload = {
        currency: 'USD',
        "payload": "{custom_payload}",
        shippingClassification: 'priority',
        webhookUrl: 'https://notification-testing-service.builder.blurb.com/notification/rpi-open-api-test/http-code-200/dummy',
        destination: {
          name: shippingInfo.name,
          company: shippingInfo.company || 'N/A',
          address1: shippingInfo.address1,
          address2: shippingInfo.address2 || '',
          address3: shippingInfo.address3 || '',
          city: shippingInfo.city,
          state: shippingInfo.state,
          postal: shippingInfo.postal,
          country: shippingInfo.country,
          phone: shippingInfo.phone,
          email: shippingInfo.email,
        },
        orderItems,
      };

      console.log('Order Payload:', JSON.stringify(orderPayload, null, 2));

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://open.api.rpiprint.com/orders/create',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': auth_header,
        },
        data: JSON.stringify(orderPayload),
      };

      const response = await axios(config);

      console.log('Response Data:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error( 'Failed to create order');
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
