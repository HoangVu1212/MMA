import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the type for a cart item
interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  stock: number;
  quantity: number;
  userId: string;
}

// Define the context type
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  removeSelectedItems: (selectedProducts: CartItem[]) => void;
}

// Create the Cart Context
const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from AsyncStorage when the app starts
  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem("cart");
        if (storedCart) {
          setCart(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    };

    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it updates
  const saveCart = async (updatedCart: CartItem[]) => {
    try {
      await AsyncStorage.setItem("cart", JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.id === item.id && cartItem.userId === item.userId
      );
  
      let updatedCart;
  
      if (existingItem) {
        updatedCart = prevCart.map((cartItem) =>
          cartItem.id === item.id && cartItem.userId === item.userId
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      } else {
        updatedCart = [...prevCart, { ...item}];
      }
  
      saveCart(updatedCart);
      return updatedCart;
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((cartItem) =>
        cartItem.id === id ? { ...cartItem, quantity } : cartItem
      );
      saveCart(updatedCart);
      return updatedCart;
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((cartItem) => cartItem.id !== id);
      saveCart(updatedCart);
      return updatedCart;
    });
  };

  const removeSelectedItems = (selectedProducts: CartItem[]) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter(
        (cartItem) => !selectedProducts.some((item) => item.id === cartItem.id)
      );
      saveCart(updatedCart);
      return updatedCart;
    });
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, removeSelectedItems }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook to use the Cart Context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

