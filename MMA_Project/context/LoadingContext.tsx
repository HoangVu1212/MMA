import React, { createContext, useContext, useState, ReactNode } from "react";
import { View, ActivityIndicator, StyleSheet, Modal, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean, message?: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Đang tải...");

  const setLoading = (loading: boolean, message: string = "Đang tải...") => {
    setIsLoading(loading);
    setLoadingMessage(message);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
      <Modal transparent visible={isLoading} animationType="fade">
        <View style={styles.overlay}>
          <LinearGradient
            colors={["#1a1a1a", "#2d2d2d"]}
            style={styles.loadingContainer}
          >
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.loadingText}>{loadingMessage}</Text>
          </LinearGradient>
        </View>
      </Modal>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    minWidth: 160,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingText: {
    color: "#fff",
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
  },
});

