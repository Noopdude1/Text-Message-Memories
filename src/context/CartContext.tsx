// CartContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { CartItem } from '../types';

// Define types for context state
export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
}

// Create context with default values
const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart data from AsyncStorage on initial load
  useEffect(() => {
    const loadCartData = async () => {
      try {
        const storedCart = await AsyncStorage.getItem('cart');
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
      }
    };
    loadCartData();
  }, []);

  // Sync cart data to AsyncStorage whenever it changes
  useEffect(() => {
    const saveDataToStorage = async () => {
      try {
        await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving data to AsyncStorage:', error);
        Alert.alert('Error', 'Failed to save cart data');
      }
    };
    saveDataToStorage();
  }, [cartItems]);

  const recalculatePrices = (items: CartItem[]): CartItem[] => {
    const basePrice = 21.99;
    const discountRate = 0.15;

    return items.map((item, index) => ({
      ...item,
      price: index === 0 ? basePrice : parseFloat((basePrice * (1 - discountRate)).toFixed(2)),
    }));
  };

  const addToCart = (item: CartItem) => {
    setCartItems((prevItems) => {
      const exists = prevItems.some((cartItem) => cartItem.id === item.id);
      if (exists) {
        Alert.alert('Item already in cart', 'This item is already added to your cart.');
        return prevItems;
      }
      const updatedItems = [...prevItems, item];
      return recalculatePrices(updatedItems);
    });
  };

  // Remove item from the cart
  const removeFromCart = (itemId: string) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.id !== itemId);
      if (updatedItems.length === prevItems.length) {
        Alert.alert('Item not found', 'The item you are trying to remove does not exist.');
        return prevItems;
      }
      return recalculatePrices(updatedItems);
    });
  };

  // Clear all items from the cart
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartProvider, CartContext };

// Custom hook to use the CartContext
export const useCart = (): CartContextType => {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
