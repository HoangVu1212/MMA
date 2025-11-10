import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { favorites, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userData");
        if (storedUserId) {
          const parsedUser = JSON.parse(storedUserId);
          setUserId(parsedUser._id);
        }
      } catch (error) {
        console.error("Error fetching userId:", error);
      }
    };
    getUserId();
  }, []);

  const userFavorites = favorites.filter((item) => item.userId === userId);

  const handleAddToCart = (item: any) => {
    addToCart({
      ...item,
      quantity: 1,
      stock: 100,
      userId: userId || "",
    });
    Alert.alert("Thành công", `${item.name} đã được thêm vào giỏ hàng!`);
  };

  const handleRemoveFavorite = (id: number) => {
    Alert.alert(
      "Xóa yêu thích",
      "Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => removeFromFavorites(id),
        },
      ]
    );
  };

  const renderFavoriteItem = ({ item }: any) => (
    <View style={styles.itemCard}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>
          {item.price?.toLocaleString()} VNĐ
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => handleAddToCart(item)}
        >
          <LinearGradient
            colors={["#D4AF37", "#F4D03F"]}
            style={styles.cartButtonGradient}
          >
            <Ionicons name="cart" size={20} color="#1a1a1a" />
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleRemoveFavorite(item.id)}
        >
          <Ionicons name="trash" size={20} color="#FF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <View style={styles.backButtonInner}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </View>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>YÊU THÍCH</Text>
          <Text style={styles.headerSubtitle}>
            {userFavorites.length} sản phẩm
          </Text>
        </View>
        <View style={{ width: 48 }} />
      </LinearGradient>

      {/* Content */}
      {userFavorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={100} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có sản phẩm yêu thích</Text>
          <Text style={styles.emptySubtext}>
            Hãy thêm sản phẩm bạn thích vào danh sách này
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate("PerfumeList" as never)}
          >
            <LinearGradient
              colors={["#D4AF37", "#F4D03F", "#D4AF37"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shopButtonGradient}
            >
              <Ionicons name="storefront" size={20} color="#1a1a1a" />
              <Text style={styles.shopButtonText}>Khám phá ngay</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={userFavorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  listContent: {
    padding: 16,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#D4AF37",
  },
  actions: {
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  cartButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
  },
  cartButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE0E0",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#666",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 30,
  },
  shopButton: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
  },
  shopButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 10,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
});

export default FavoritesScreen;

