import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the type for a favorite item
interface FavoriteItem {
  id: number;
  name: string;
  image: string;
  price: number;
  userId: string;
}

// Define the context type
interface FavoritesContextType {
  favorites: FavoriteItem[];
  addToFavorites: (item: FavoriteItem) => void;
  removeFromFavorites: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

// Create the Favorites Context
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Load favorites from AsyncStorage when the app starts
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem("favorites");
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    };

    loadFavorites();
  }, []);

  // Save favorites to AsyncStorage whenever it updates
  const saveFavorites = async (updatedFavorites: FavoriteItem[]) => {
    try {
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  };

  const addToFavorites = (item: FavoriteItem) => {
    setFavorites((prevFavorites) => {
      const exists = prevFavorites.find(
        (fav) => fav.id === item.id && fav.userId === item.userId
      );

      if (exists) {
        return prevFavorites; // Already in favorites
      }

      const updatedFavorites = [...prevFavorites, item];
      saveFavorites(updatedFavorites);
      return updatedFavorites;
    });
  };

  const removeFromFavorites = (id: number) => {
    setFavorites((prevFavorites) => {
      const updatedFavorites = prevFavorites.filter((fav) => fav.id !== id);
      saveFavorites(updatedFavorites);
      return updatedFavorites;
    });
  };

  const isFavorite = (id: number) => {
    return favorites.some((fav) => fav.id === id);
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addToFavorites, removeFromFavorites, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

// Hook to use the Favorites Context
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};

