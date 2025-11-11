import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiService from "../services/api";

export interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  avatar?: string;
}

interface UserContextType {
  userData: UserData | null;
  isLoading: boolean;
  userId: string | null;
  setUserData: (data: UserData | null) => Promise<void>;
  refreshUserData: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from AsyncStorage on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const storedData = await AsyncStorage.getItem("userData");
      if (storedData) {
        const parsedData: UserData = JSON.parse(storedData);
        // Ensure address is always a string
        setUserDataState({
          ...parsedData,
          address: parsedData.address || "",
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUserData = async (data: UserData | null) => {
    try {
      if (data) {
        // Ensure address is always a string
        const normalizedData = {
          ...data,
          address: data.address || "",
        };
        await AsyncStorage.setItem("userData", JSON.stringify(normalizedData));
        setUserDataState(normalizedData);
      } else {
        await AsyncStorage.removeItem("userData");
        setUserDataState(null);
      }
    } catch (error) {
      console.error("Error saving user data:", error);
      throw error;
    }
  };

  const refreshUserData = async () => {
    if (!userData?._id) return;

    try {
      const freshData = await apiService.getProfile(userData._id);
      const normalizedData = {
        ...freshData,
        address: freshData.address || "",
      };
      await AsyncStorage.setItem("userData", JSON.stringify(normalizedData));
      setUserDataState(normalizedData);
    } catch (error) {
      console.error("Error refreshing user data:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userData");
      setUserDataState(null);
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  const userId = userData?._id || null;

  return (
    <UserContext.Provider
      value={{
        userData,
        isLoading,
        userId,
        setUserData,
        refreshUserData,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

