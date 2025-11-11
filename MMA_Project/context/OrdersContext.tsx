import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the type for an order item
interface OrderProduct {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  orderId: string;
  orderDate: string;
  totalAmount: number;
  status: "pending" | "processing" | "delivered" | "cancelled";
  products: OrderProduct[];
  userId: string;
  deliveryAddress?: string;
}

// Define the context type
interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getUserOrders: (userId: string) => Order[];
}

// Create the Orders Context
const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Load orders from AsyncStorage when the app starts
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const storedOrders = await AsyncStorage.getItem("orders");
        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        }
      } catch (error) {
        console.error("Error loading orders:", error);
      }
    };

    loadOrders();
  }, []);

  // Save orders to AsyncStorage whenever it updates
  const saveOrders = async (updatedOrders: Order[]) => {
    try {
      await AsyncStorage.setItem("orders", JSON.stringify(updatedOrders));
    } catch (error) {
      console.error("Error saving orders:", error);
    }
  };

  const addOrder = (order: Order) => {
    setOrders((prevOrders) => {
      const updatedOrders = [order, ...prevOrders];
      saveOrders(updatedOrders);
      return updatedOrders;
    });
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prevOrders) => {
      const updatedOrders = prevOrders.map((order) =>
        order.orderId === orderId ? { ...order, status } : order
      );
      saveOrders(updatedOrders);
      return updatedOrders;
    });
  };

  const getOrderById = (orderId: string) => {
    return orders.find((order) => order.orderId === orderId);
  };

  const getUserOrders = (userId: string) => {
    return orders.filter((order) => order.userId === userId);
  };

  return (
    <OrdersContext.Provider
      value={{ orders, addOrder, updateOrderStatus, getOrderById, getUserOrders }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

// Hook to use the Orders Context
export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
};

