import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigationParams, CartItem } from '../../types';
import TopBar from '../../components/TopBar';
import BottomBar from '../../components/BottomBar';
import { DustbinIcon, ShoppingCartIcon } from '../../Assets/Icons';

type CartScreenNavigationProp = NativeStackNavigationProp<NavigationParams, 'Cart'>;

const CartScreen: React.FC = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const navigation = useNavigation<CartScreenNavigationProp>();

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price, 0).toFixed(2);
  }, [cartItems]);

  const handleRemoveItem = (id: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(id) },
      ]
    );
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart is Empty', 'Add some items to your cart before proceeding.');
    } else {
      navigation.navigate('Checkout');
    }
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Are you sure you want to clear the cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearCart() },
    ]);
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.coverImage }} style={styles.itemImage} />
      <View style={styles.cartItemDetails}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={styles.removeButton}>
        <DustbinIcon color="#FF3B30" size={24} />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <TopBar
        title="Your Cart"
        currentStep={4}
        totalSteps={5}
      />
      <View style={styles.content}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <ShoppingCartIcon color="#666" size={64} />
            <Text style={styles.emptyCartText}>Your cart is empty.</Text>
            <TouchableOpacity
              style={styles.emptyCartButton}
              onPress={() => navigation.navigate('Conversations')}
            >
              <Text style={styles.emptyCartButtonText}>Start Creating Stories</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
            />
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total:</Text>
              <Text style={styles.totalPrice}>${totalPrice}</Text>
            </View>
            <TouchableOpacity
              style={styles.continueShoppingButton}
              onPress={() => navigation.navigate('Conversations')}
            >
              <Text style={styles.continueShoppingText}>Continue Shopping</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <BottomBar
        currentStep={4}
        totalSteps={5}
        onNext={handleProceedToCheckout}
        onBack={handleClearCart}
        isNextEnabled={cartItems.length > 0}
        nextLabel="Checkout"
        backLabel="Clear Cart"
      />
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 16,
    paddingTop: 8,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
    fontFamily: 'Poppins-Medium',
  },
  emptyCartButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyCartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  cartItemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-Medium',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  removeButton: {
    padding: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-Medium',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
    fontFamily: 'Poppins-Bold',
  },
  continueShoppingButton: {
    backgroundColor: '#34C759',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  continueShoppingText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartScreen;
