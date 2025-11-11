import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";
import perfumeData from "../data/products.json";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useUser } from "../context/UserContext";

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

interface Perfume {
  id: number;
  name: string;
  scent: string;
  size: string;
  price: number;
  stock: number;
  quantity: number;
  image: string;
  ingredients: string;
  description: string;
  volume: string;
  concentration: string;
  madeIn: string;
  manufacturer: string;
  notes: string;
  rating?: number;
  reviewCount?: number;
  purchaseCount?: number;
}

const PerfumeList = () => {
  const navigation = useNavigation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { userId } = useUser();

  const handleAddToCart = (item: Perfume, event: any) => {
    event.stopPropagation();
    
    if (!userId) {
      Alert.alert("Thông báo", "Bạn cần đăng nhập để thêm vào giỏ hàng!");
      return;
    }

    addToCart({
      id: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      stock: item.stock,
      quantity: 1,
      userId: userId,
    });

    Alert.alert("Thành công", `${item.name} đã được thêm vào giỏ hàng!`);
  };

  const handleToggleFavorite = (item: Perfume, event: any) => {
    event.stopPropagation();
    
    if (!userId) {
      Alert.alert("Thông báo", "Bạn cần đăng nhập để thêm vào yêu thích!");
      return;
    }

    if (isFavorite(item.id)) {
      removeFromFavorites(item.id);
      Alert.alert("Đã xóa", `${item.name} đã được xóa khỏi yêu thích!`);
    } else {
      addToFavorites({
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        userId: userId,
      });
      Alert.alert("Thành công", `${item.name} đã được thêm vào yêu thích!`);
    }
  };

  const renderGridItem = ({ item }: { item: Perfume }) => (
    <TouchableOpacity
      style={styles.gridCard}
      onPress={() => navigation.navigate("DetailPerfume", { item })}
      activeOpacity={0.9}
    >
      <View style={styles.gridImageContainer}>
        <Image source={{ uri: item.image }} style={styles.gridImage} />
        <View style={styles.gridBadge}>
          <Text style={styles.gridBadgeText}>NEW</Text>
        </View>
        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.gridFavoriteButton}
          onPress={(e) => handleToggleFavorite(item, e)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isFavorite(item.id) ? ['#FF1744', '#FF5252'] : ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.3)']}
            style={styles.gridFavoriteCircle}
          >
            <Ionicons 
              name={isFavorite(item.id) ? "heart" : "heart-outline"} 
              size={18} 
              color="#fff" 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <View style={styles.gridInfo}>
        <Text style={styles.gridName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.gridScent}>{item.scent}</Text>
        
        {/* Rating and Purchase Count */}
        <View style={styles.gridRatingRow}>
          <View style={styles.gridStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= Math.round(item.rating || 4.5) ? "star" : "star-outline"}
                size={12}
                color={star <= Math.round(item.rating || 4.5) ? "#FFD700" : "#666"}
              />
            ))}
          </View>
          <Text style={styles.gridRatingText}>
            {(item.rating || 4.5).toFixed(1)}
          </Text>
          <Text style={styles.gridPurchaseCount}>
            ({(item.purchaseCount || Math.floor(Math.random() * 2000 + 100)).toLocaleString('vi-VN')})
          </Text>
        </View>

        <View style={styles.gridBottom}>
          <Text style={styles.gridPrice}>
            {item.price.toLocaleString('vi-VN')} ₫
          </Text>
          {/* Add to Cart Button */}
          <TouchableOpacity
            style={styles.gridCartButton}
            onPress={(e) => handleAddToCart(item, e)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#D4AF37', '#F4D03F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gridCartGradient}
            >
              <Ionicons name="cart" size={16} color="#1a1a1a" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: Perfume }) => (
    <TouchableOpacity
      style={styles.listCard}
      onPress={() => navigation.navigate("DetailPerfume", { item })}
      activeOpacity={0.9}
    >
      <View style={styles.listImageContainer}>
        <Image source={{ uri: item.image }} style={styles.listImage} />
        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.listFavoriteButton}
          onPress={(e) => handleToggleFavorite(item, e)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isFavorite(item.id) ? ['#FF1744', '#FF5252'] : ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.3)']}
            style={styles.listFavoriteCircle}
          >
            <Ionicons 
              name={isFavorite(item.id) ? "heart" : "heart-outline"} 
              size={16} 
              color="#fff" 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <View style={styles.listInfo}>
        <Text style={styles.listName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.listScent}>{item.scent}</Text>
        
        {/* Rating and Purchase Count */}
        <View style={styles.listRatingRow}>
          <View style={styles.listStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= Math.round(item.rating || 4.5) ? "star" : "star-outline"}
                size={12}
                color={star <= Math.round(item.rating || 4.5) ? "#FFD700" : "#666"}
              />
            ))}
          </View>
          <Text style={styles.listRatingText}>
            {(item.rating || 4.5).toFixed(1)}
          </Text>
          <Text style={styles.listPurchaseCount}>
            • {(item.purchaseCount || Math.floor(Math.random() * 2000 + 100)).toLocaleString('vi-VN')} đã mua
          </Text>
        </View>

        <View style={styles.listBottom}>
          <Text style={styles.listPrice}>
            {item.price.toLocaleString('vi-VN')} ₫
          </Text>
          <View style={styles.listVolume}>
            <Ionicons name="water" size={14} color="#888" />
            <Text style={styles.listVolumeText}>{item.volume}</Text>
          </View>
        </View>
      </View>
      {/* Action Buttons */}
      <View style={styles.listActions}>
        <TouchableOpacity
          style={styles.listActionButton}
          onPress={(e) => handleAddToCart(item, e)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#D4AF37', '#F4D03F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.listActionGradient}
          >
            <Ionicons name="cart" size={20} color="#1a1a1a" />
          </LinearGradient>
        </TouchableOpacity>
        <Ionicons name="chevron-forward" size={24} color="#ccc" style={{ marginLeft: 8 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header với gradient */}
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách nước hoa</Text>
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            onPress={() => setViewMode('grid')}
            style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
          >
            <Ionicons 
              name="grid" 
              size={20} 
              color={viewMode === 'grid' ? '#D4AF37' : '#fff'} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
          >
            <Ionicons 
              name="list" 
              size={20} 
              color={viewMode === 'list' ? '#D4AF37' : '#fff'} 
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList<Perfume>
        data={perfumeData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
        contentContainerStyle={styles.listContainer}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="flower-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: StatusBar.currentHeight || 10,
    paddingBottom: 15,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    letterSpacing: 0.5,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 4,
  },
  viewModeButton: {
    padding: 6,
    borderRadius: 6,
  },
  viewModeButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  listContainer: {
    padding: 16,
  },
  // Grid View Styles
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    marginRight: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  gridImageContainer: {
    width: "100%",
    height: 200,
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  gridImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  gridBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gridBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  gridInfo: {
    padding: 12,
  },
  gridName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
    minHeight: 38,
  },
  gridScent: {
    fontSize: 11,
    color: "#888",
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gridRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  gridStars: {
    flexDirection: "row",
    gap: 1,
  },
  gridRatingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1a1a1a",
    marginLeft: 2,
  },
  gridPurchaseCount: {
    fontSize: 10,
    color: "#888",
    marginLeft: 2,
  },
  gridBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#D4AF37",
    flex: 1,
  },
  gridFavoriteButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
  },
  gridFavoriteCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  gridCartButton: {
    marginLeft: 8,
  },
  gridCartGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  // List View Styles
  listCard: {
    flexDirection: 'row',
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    alignItems: 'center',
  },
  listImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  listImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  listFavoriteButton: {
    position: 'absolute',
    top: 6,
    left: 6,
    zIndex: 10,
  },
  listFavoriteCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  listScent: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  listStars: {
    flexDirection: "row",
    gap: 1,
  },
  listRatingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1a1a1a",
    marginLeft: 2,
  },
  listPurchaseCount: {
    fontSize: 10,
    color: "#888",
    marginLeft: 2,
  },
  listBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#D4AF37",
  },
  listVolume: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  listVolumeText: {
    fontSize: 11,
    color: "#888",
    marginLeft: 4,
    fontWeight: '600',
  },
  listActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listActionButton: {
    marginRight: 8,
  },
  listActionGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    marginTop: 16,
  },
});

export default PerfumeList;
