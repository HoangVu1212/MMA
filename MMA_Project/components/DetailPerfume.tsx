import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  Alert,
  FlatList,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import Config from './config';
import perfumeData from "../data/products.json";

const { width } = Dimensions.get('window');
const RELATED_PRODUCT_WIDTH = (width - 48) / 2.5; // 2.5 items visible

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

type DetailParamList = {
  DetailPerfume: {
    item: Perfume;
  };
};

type DetailPerfumeRouteProp = RouteProp<DetailParamList, "DetailPerfume">;

const DetailPerfume: React.FC = () => {
  const route = useRoute<DetailPerfumeRouteProp>();
  const navigation = useNavigation();
  const { item } = route.params;
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const [quantity, setQuantity] = useState(item.quantity);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'notes'>('description');
  const [relatedProducts, setRelatedProducts] = useState<Perfume[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    fetchRelatedProducts();
    loadUserId();
  }, [item.id]);

  const loadUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        setUserId(parsedUserData._id);
      }
    } catch (error) {
      console.error("Error loading userId:", error);
    }
  };

  const fetchRelatedProducts = async () => {
    setLoadingRelated(true);
    try {
      const response = await fetch(`${Config.API_BASE_URL}/api/product`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data: Perfume[] = await response.json();
        // Lọc ra sản phẩm hiện tại và lấy 4 sản phẩm khác
        const filtered = data.filter(perfume => perfume.id !== item.id).slice(0, 4);
        setRelatedProducts(filtered);
      } else {
        // Fallback to local data if API fails
        const filtered = (perfumeData as Perfume[]).filter(perfume => perfume.id !== item.id).slice(0, 4);
        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm liên quan:', error);
      // Fallback to local data if API fails
      const filtered = (perfumeData as Perfume[]).filter(perfume => perfume.id !== item.id).slice(0, 4);
      setRelatedProducts(filtered);
    } finally {
      setLoadingRelated(false);
    }
  };

  const increaseQuantity = () => {
    if (quantity < item.stock) {
      setQuantity(quantity + 1);
    } else {
      Alert.alert("Thông báo", "Số lượng không thể vượt quá tồn kho");
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        Alert.alert("Thông báo", "Bạn cần đăng nhập để thêm vào yêu thích!");
        return;
      }

      const parsedUserData = JSON.parse(userData);
      const userId = parsedUserData._id;

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
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleAddToCart = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        Alert.alert("Thông báo", "Bạn cần đăng nhập để thêm vào giỏ hàng!");
        return;
      }
  
      const parsedUserData = JSON.parse(userData);
      const userId = parsedUserData._id;
  
      addToCart({
        id: item.id,
        userId: userId,
        name: item.name,
        image: item.image,
        price: item.price,
        stock: item.stock,
        quantity: quantity,
      });
  
      Alert.alert("Thành công", `${item.name} đã được thêm vào giỏ hàng!`);
    } catch (error) {
      console.error("Lỗi khi lấy UserData từ AsyncStorage:", error);
    }
  };

  const handleBuyNow = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        Alert.alert("Thông báo", "Bạn cần đăng nhập để mua hàng!");
        return;
      }
  
      const parsedUserData = JSON.parse(userData);
      const userId = parsedUserData._id;
  
      addToCart({
        id: item.id,
        userId: userId,
        name: item.name,
        image: item.image,
        price: item.price,
        stock: item.stock,
        quantity: quantity,
      });
  
      navigation.navigate("CheckoutScreen", { 
        selectedProducts: [{
          ...item,
          quantity: quantity,
          userId: userId,
        }]
      });
    } catch (error) {
      console.error("Lỗi khi lấy UserData từ AsyncStorage:", error);
    }
  };

  const handleRelatedProductPress = (product: Perfume) => {
    navigation.replace("DetailPerfume", { item: product });
  };

  const handleAddRelatedToCart = async (product: Perfume) => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        Alert.alert("Thông báo", "Bạn cần đăng nhập để thêm vào giỏ hàng!");
        return;
      }
  
      const parsedUserData = JSON.parse(userData);
      const userId = parsedUserData._id;
  
      addToCart({
        id: product.id,
        userId: userId,
        name: product.name,
        image: product.image,
        price: product.price,
        stock: product.stock,
        quantity: 1,
      });
  
      Alert.alert("Thành công", `${product.name} đã được thêm vào giỏ hàng!`);
    } catch (error) {
      console.error("Lỗi khi lấy UserData từ AsyncStorage:", error);
    }
  };

  const renderRelatedProduct = ({ item: product }: { item: Perfume }) => (
    <TouchableOpacity
      style={styles.relatedProductCard}
      onPress={() => handleRelatedProductPress(product)}
      activeOpacity={0.9}
    >
      <View style={styles.relatedProductImageContainer}>
        <Image source={{ uri: product.image }} style={styles.relatedProductImage} />
        <TouchableOpacity
          style={styles.relatedProductAddButton}
          onPress={(e) => {
            e.stopPropagation();
            handleAddRelatedToCart(product);
          }}
        >
          <Ionicons name="cart" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.relatedProductInfo}>
        <Text style={styles.relatedProductName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.relatedProductScent}>{product.scent}</Text>
        
        {/* Rating */}
        <View style={styles.relatedRatingRow}>
          <View style={styles.relatedStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= Math.round(product.rating || 4.5) ? "star" : "star-outline"}
                size={10}
                color={star <= Math.round(product.rating || 4.5) ? "#FFD700" : "#666"}
              />
            ))}
          </View>
          <Text style={styles.relatedRatingText}>
            {(product.rating || 4.5).toFixed(1)}
          </Text>
        </View>

        <Text style={styles.relatedProductPrice}>
          {product.price.toLocaleString('vi-VN')} ₫
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
            style={styles.imageGradient}
          />
          
          {/* Header with Back Button */}
          <View style={styles.headerOverlay}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate("PerfumeList" as never);
                }
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']}
                style={styles.backButtonGradient}
              >
                <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Favorite Button */}
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={handleToggleFavorite}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isFavorite(item.id) 
                  ? ['#FF1744', '#FF5252', '#FF1744'] 
                  : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']}
                style={styles.favoriteButtonGradient}
              >
                <Ionicons 
                  name={isFavorite(item.id) ? "heart" : "heart-outline"} 
                  size={22} 
                  color={isFavorite(item.id) ? "#fff" : "#1a1a1a"} 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <LinearGradient
            colors={['#fff', '#fafafa']}
            style={styles.infoGradient}
          >
            <View style={styles.headerInfo}>
              <View style={styles.badgeContainer}>
                <LinearGradient
                  colors={['#D4AF37', '#C9A227', '#B8941F']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.badge}
                >
                  <Ionicons name="diamond" size={12} color="#fff" />
                  <Text style={styles.badgeText}>PREMIUM</Text>
                </LinearGradient>
                <View style={styles.stockBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#fff" />
                  <Text style={styles.stockText}>Còn {item.stock} sản phẩm</Text>
                </View>
              </View>
              
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.scent}>{item.scent}</Text>
              
              {/* Rating and Stats Card */}
              <View style={styles.ratingCard}>
                <View style={styles.ratingRow}>
                  <View style={styles.starContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= Math.round(item.rating || 4.5) ? "star" : "star-outline"}
                        size={18}
                        color={star <= Math.round(item.rating || 4.5) ? "#FFD700" : "#ddd"}
                      />
                    ))}
                  </View>
                  <Text style={styles.ratingText}>
                    {(item.rating || 4.5).toFixed(1)}
                  </Text>
                  <Text style={styles.reviewCount}>
                    ({(item.reviewCount || Math.floor(Math.random() * 500 + 50)).toLocaleString('vi-VN')} đánh giá)
                  </Text>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <LinearGradient
                      colors={['#D4AF37', '#F4D03F']}
                      style={styles.statIconBg}
                    >
                      <Ionicons name="bag-check" size={14} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.statText}>
                      {(item.purchaseCount || Math.floor(Math.random() * 2000 + 100)).toLocaleString('vi-VN')} đã mua
                    </Text>
                  </View>
                </View>
              </View>

              {/* Price Card */}
              <View style={styles.priceCard}>
                <View style={styles.priceContainer}>
                  <View>
                    <Text style={styles.priceLabel}>Giá bán</Text>
                    <Text style={styles.price}>{item.price.toLocaleString('vi-VN')} ₫</Text>
                  </View>
                  <View style={styles.volumeBadge}>
                    <Ionicons name="water" size={16} color="#D4AF37" />
                    <Text style={styles.volume}>{item.volume}</Text>
                  </View>
                </View>
              </View>
            </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Số lượng</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                onPress={decreaseQuantity}
                style={[styles.quantityButton, quantity === 1 && styles.quantityButtonDisabled]}
                disabled={quantity === 1}
              >
                <Ionicons 
                  name="remove" 
                  size={20} 
                  color={quantity === 1 ? "#ccc" : "#1a1a1a"} 
                />
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantity}</Text>
              </View>
              <TouchableOpacity
                onPress={increaseQuantity}
                style={[styles.quantityButton, quantity >= item.stock && styles.quantityButtonDisabled]}
                disabled={quantity >= item.stock}
              >
                <Ionicons 
                  name="add" 
                  size={20} 
                  color={quantity >= item.stock ? "#ccc" : "#1a1a1a"} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
              activeOpacity={0.8}
            >
              <Ionicons name="cart-outline" size={22} color="#1a1a1a" />
              <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buyNowButton}
              onPress={handleBuyNow}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#D4AF37', '#C9A227', '#B8941F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buyNowGradient}
              >
                <Text style={styles.buyNowText}>Mua ngay</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* View Cart Button */}
          <TouchableOpacity
            style={styles.viewCartButton}
            onPress={() => navigation.navigate("CartScreen")}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#1a1a1a', '#2d2d2d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.viewCartButtonGradient}
            >
              <Ionicons name="cart" size={20} color="#fff" />
              <Text style={styles.viewCartButtonText}>Xem giỏ hàng</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'description' && styles.tabActive]}
              onPress={() => setActiveTab('description')}
            >
              <Text style={[styles.tabText, activeTab === 'description' && styles.tabTextActive]}>
                Mô tả
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'details' && styles.tabActive]}
              onPress={() => setActiveTab('details')}
            >
              <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
                Chi tiết
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'notes' && styles.tabActive]}
              onPress={() => setActiveTab('notes')}
            >
              <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>
                Hương thơm
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'description' && (
              <View>
                <Text style={styles.descriptionText}>{item.description}</Text>
                <View style={styles.featureList}>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.featureText}>Cam kết 100% chính hãng</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.featureText}>Giao hàng toàn quốc</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.featureText}>Đổi trả trong 7 ngày</Text>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'details' && (
              <View>
                <View style={styles.detailRow}>
                  <Ionicons name="water" size={20} color="#D4AF37" />
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailLabel}>Dung tích</Text>
                    <Text style={styles.detailValue}>{item.volume}</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="flask" size={20} color="#D4AF37" />
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailLabel}>Nồng độ</Text>
                    <Text style={styles.detailValue}>{item.concentration}</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="flower" size={20} color="#D4AF37" />
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailLabel}>Hương thơm chính</Text>
                    <Text style={styles.detailValue}>{item.scent}</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={20} color="#D4AF37" />
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailLabel}>Xuất xứ</Text>
                    <Text style={styles.detailValue}>{item.madeIn}</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="business" size={20} color="#D4AF37" />
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailLabel}>Nhà sản xuất</Text>
                    <Text style={styles.detailValue}>{item.manufacturer}</Text>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'notes' && (
              <View>
                <Text style={styles.notesTitle}>Cấu trúc hương thơm</Text>
                <View style={styles.notesContainer}>
                  <Text style={styles.notesText}>{item.notes}</Text>
                </View>
                <View style={styles.ingredientsContainer}>
                  <Text style={styles.ingredientsTitle}>Thành phần</Text>
                  <Text style={styles.ingredientsText}>{item.ingredients}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedProductsSection}>
              <View style={styles.relatedProductsHeader}>
                <Text style={styles.relatedProductsTitle}>Sản phẩm khác</Text>
                <TouchableOpacity onPress={() => navigation.navigate("PerfumeList" as never)}>
                  <Text style={styles.seeAllText}>Xem tất cả →</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={relatedProducts}
                renderItem={renderRelatedProduct}
                keyExtractor={(product) => product.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedProductsList}
              />
            </View>
          )}
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageContainer: {
    width: "100%",
    height: 400,
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight || 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
  },
  backButton: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  favoriteButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    overflow: 'hidden',
  },
  infoGradient: {
    padding: 24,
  },
  headerInfo: {
    marginBottom: 24,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 8,
    gap: 6,
    elevation: 4,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 8,
    gap: 6,
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  stockText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  name: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  scent: {
    fontSize: 16,
    color: "#888",
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  ratingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  starContainer: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 13,
    color: "#999",
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  statIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#f5e6c8',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  price: {
    fontSize: 32,
    fontWeight: "900",
    color: "#D4AF37",
    letterSpacing: 0.5,
  },
  volumeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#f5e6c8',
  },
  volume: {
    fontSize: 14,
    color: "#D4AF37",
    fontWeight: '700',
  },
  quantitySection: {
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityDisplay: {
    width: 60,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  buyNowButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buyNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  viewCartButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  viewCartButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  viewCartButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
  },
  tabTextActive: {
    color: "#1a1a1a",
    fontWeight: "700",
  },
  tabContent: {
    minHeight: 200,
    paddingBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 20,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: "#333",
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 16,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: '600',
  },
  notesTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  notesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  notesText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 24,
  },
  ingredientsContainer: {
    marginTop: 8,
  },
  ingredientsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  ingredientsText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 24,
  },
  // Related Products Styles
  relatedProductsSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  relatedProductsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  relatedProductsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D4AF37",
  },
  relatedProductsList: {
    paddingRight: 20,
  },
  relatedProductCard: {
    width: RELATED_PRODUCT_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  relatedProductImageContainer: {
    width: "100%",
    height: 180,
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  relatedProductImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  relatedProductAddButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  relatedProductInfo: {
    padding: 12,
  },
  relatedProductName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
    minHeight: 36,
  },
  relatedProductScent: {
    fontSize: 10,
    color: "#888",
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  relatedRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 3,
  },
  relatedStars: {
    flexDirection: "row",
    gap: 1,
  },
  relatedRatingText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1a1a1a",
    marginLeft: 2,
  },
  relatedProductPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#D4AF37",
  },
});

export default DetailPerfume;
