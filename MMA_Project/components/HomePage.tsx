import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import Config from './config';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCart } from "../context/CartContext";

const { width } = Dimensions.get('window');

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

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const { cart } = useCart();
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bannerTextFadeAnim = useRef(new Animated.Value(0)).current;
  const productSlideAnim = useRef(new Animated.Value(0)).current;

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const quoteFadeAnim = useRef(new Animated.Value(1)).current;
  const quoteSlideAnim = useRef(new Animated.Value(0)).current;
  const quotes = [
    "Hương thơm là dấu ấn cá nhân của bạn.",
    "Mỗi chai nước hoa kể một câu chuyện riêng.",
    "Tỏa sáng với hương thơm cao cấp.",
    "Nước hoa cao cấp - Định nghĩa phong cách.",
    "Nước hoa - Đánh thức giác quan, thể hiện cá tính.",
  ];

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserId(parsedUser._id);
        }
      } catch (error) {
        console.error("Lỗi khi lấy UserData từ AsyncStorage:", error);
      }
    };

    fetchUserId();

    const fetchPerfumes = async () => {
      try {
        const response = await fetch(`${Config.API_BASE_URL}/api/product`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Không thể lấy danh sách sản phẩm');
        const data: Perfume[] = await response.json();
        setPerfumes(data);
      } catch (error: any) {
        console.error('Lỗi khi gọi API:', error);
        Alert.alert('Lỗi', 'Không thể tải danh sách sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchPerfumes();

    // Animations
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(bannerTextFadeAnim, {
        toValue: 1,
        duration: 1500,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Quote carousel animation
    const quoteInterval = setInterval(() => {
      Animated.parallel([
        Animated.timing(quoteFadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.spring(quoteSlideAnim, { toValue: 20, tension: 40, friction: 7, useNativeDriver: true }),
      ]).start(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
        quoteSlideAnim.setValue(-20);
        Animated.parallel([
          Animated.timing(quoteFadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.spring(quoteSlideAnim, { toValue: 0, tension: 40, friction: 7, useNativeDriver: true }),
        ]).start();
      });
    }, 4000);

    return () => clearInterval(quoteInterval);
  }, [fadeAnim, bannerTextFadeAnim, productSlideAnim, perfumes.length, userId]);

  // Calculate cart item count
  const cartItemCount = userId ? cart.filter((item) => item.userId === userId).length : 0;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const { addToCart } = useCart();
  const handleAddToCart = async (perfume: Perfume) => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        Alert.alert("Thông báo", "Bạn cần đăng nhập để thêm vào giỏ hàng!");
        return;
      }

      const parsedUserData = JSON.parse(userData);
      const userId = parsedUserData._id;

      addToCart({
        id: perfume.id,
        userId: userId,
        name: perfume.name,
        image: perfume.image,
        price: perfume.price,
        stock: perfume.stock,
        quantity: 1,
      });

      Alert.alert("Thành công", `${perfume.name} đã được thêm vào giỏ hàng!`);
    } catch (error) {
      console.error("Lỗi khi lấy UserData từ AsyncStorage:", error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header với gradient */}
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.headerButton}
        >
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="flower" size={24} color="#D4AF37" style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>Perfume Store</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate("CartScreen")}
          style={styles.headerButton}
        >
          <Ionicons name="cart" size={28} color="#fff" />
          {cartItemCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner - Redesigned */}
        <View style={styles.heroBanner}>
          <LinearGradient
            colors={['#1a1a1a', '#2d2d2d', '#3a3a3a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <Animated.View style={[styles.heroContent, { opacity: bannerTextFadeAnim }]}>
              <View style={styles.heroIconContainer}>
                <LinearGradient
                  colors={['#D4AF37', '#F4D03F', '#D4AF37']}
                  style={styles.heroIconGradient}
                >
                  <Ionicons name="diamond" size={40} color="#1a1a1a" />
                </LinearGradient>
              </View>
              <Text style={styles.heroTitle}>LUXURY PERFUMES</Text>
              <Text style={styles.heroSubtitle}>Nước hoa cao cấp - Khẳng định đẳng cấp</Text>
              <View style={styles.heroDivider} />
              <Text style={styles.heroDescription}>
                Hương thơm quyến rũ, chạm đến trái tim
              </Text>
              <TouchableOpacity
                style={styles.heroButton}
                onPress={() => navigation.navigate("PerfumeList")}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#D4AF37', '#F4D03F']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.heroButtonGradient}
                >
                  <Text style={styles.heroButtonText}>Khám phá ngay</Text>
                  <Ionicons name="arrow-forward-circle" size={20} color="#1a1a1a" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </LinearGradient>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#D4AF37', '#F4D03F']}
              style={styles.statIconBg}
            >
              <Ionicons name="star" size={24} color="#1a1a1a" />
            </LinearGradient>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Sản phẩm</Text>
          </View>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.statIconBg}
            >
              <Ionicons name="people" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.statNumber}>10K+</Text>
            <Text style={styles.statLabel}>Khách hàng</Text>
          </View>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              style={styles.statIconBg}
            >
              <Ionicons name="shield-checkmark" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Chính hãng</Text>
          </View>
        </View>

        {/* Featured Products Section */}
        <View style={styles.featuredContainer}>
          <View style={styles.sectionHeaderNew}>
            <View style={styles.sectionTitleWrapper}>
              <View style={styles.sectionIconBg}>
                <Ionicons name="flame" size={22} color="#D4AF37" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
                <Text style={styles.sectionSubtitle}>Top bán chạy nhất</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate("PerfumeList")}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
              <Ionicons name="chevron-forward" size={18} color="#D4AF37" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
            </View>
          ) : perfumes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="flower-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productScrollContainer}
            >
              {perfumes.slice(0, 5).map((perfume, index) => (
                <Animated.View
                  key={perfume.id}
                  style={[
                    styles.productCardNew,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                      })}]
                    }
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => navigation.navigate("DetailPerfume", { item: perfume })}
                    activeOpacity={0.9}
                  >
                    <View style={styles.productImageContainerNew}>
                      <LinearGradient
                        colors={['#f8f9fa', '#fff']}
                        style={styles.imageGradientBg}
                      >
                        <Image source={{ uri: perfume.image }} style={styles.productImageNew} />
                      </LinearGradient>
                      <View style={styles.productBadgeNew}>
                        <LinearGradient
                          colors={['#FF4444', '#FF6B6B']}
                          style={styles.badgeGradient}
                        >
                          <Ionicons name="star" size={12} color="#fff" />
                          <Text style={styles.badgeTextNew}>HOT</Text>
                        </LinearGradient>
                      </View>
                    </View>
                    <View style={styles.productInfoNew}>
                      <View style={styles.productScentBadge}>
                        <Ionicons name="leaf" size={12} color="#4CAF50" />
                        <Text style={styles.productScentNew}>{perfume.scent}</Text>
                      </View>
                      <Text style={styles.productNameNew} numberOfLines={2}>{perfume.name}</Text>
                      
                      {/* Rating and Purchase Count */}
                      <View style={styles.homeRatingRow}>
                        <View style={styles.homeStars}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name={star <= Math.round(perfume.rating || 4.5) ? "star" : "star-outline"}
                              size={11}
                              color={star <= Math.round(perfume.rating || 4.5) ? "#FFD700" : "#666"}
                            />
                          ))}
                        </View>
                        <Text style={styles.homeRatingText}>
                          {(perfume.rating || 4.5).toFixed(1)}
                        </Text>
                        <Text style={styles.homePurchaseCount}>
                          • {(perfume.purchaseCount || Math.floor(Math.random() * 2000 + 100)).toLocaleString('vi-VN')} đã mua
                        </Text>
                      </View>

                      <View style={styles.priceRow}>
                        <View>
                          <Text style={styles.priceLabel}>Giá bán</Text>
                          <Text style={styles.productPriceNew}>
                            {perfume.price.toLocaleString('vi-VN')} ₫
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.addButtonNew}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleAddToCart(perfume);
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={['#D4AF37', '#F4D03F']}
                            style={styles.addButtonGradientNew}
                          >
                            <Ionicons name="cart" size={20} color="#1a1a1a" />
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Why Choose Us Section */}
        <View style={styles.whyChooseContainer}>
          <View style={styles.whyChooseHeader}>
            <Ionicons name="trophy" size={32} color="#D4AF37" />
            <Text style={styles.whyChooseTitle}>Tại sao chọn chúng tôi?</Text>
          </View>
          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <LinearGradient
                colors={['#D4AF37', '#F4D03F']}
                style={styles.featureIconBg}
              >
                <Ionicons name="shield-checkmark" size={28} color="#1a1a1a" />
              </LinearGradient>
              <Text style={styles.featureTitle}>100% Chính hãng</Text>
              <Text style={styles.featureDesc}>Cam kết hàng chính hãng từ thương hiệu</Text>
            </View>
            <View style={styles.featureCard}>
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.featureIconBg}
              >
                <Ionicons name="rocket" size={28} color="#fff" />
              </LinearGradient>
              <Text style={styles.featureTitle}>Giao hàng nhanh</Text>
              <Text style={styles.featureDesc}>Miễn phí vận chuyển toàn quốc</Text>
            </View>
            <View style={styles.featureCard}>
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.featureIconBg}
              >
                <Ionicons name="gift" size={28} color="#fff" />
              </LinearGradient>
              <Text style={styles.featureTitle}>Ưu đãi hấp dẫn</Text>
              <Text style={styles.featureDesc}>Nhiều chương trình khuyến mãi</Text>
            </View>
            <View style={styles.featureCard}>
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.featureIconBg}
              >
                <Ionicons name="headset" size={28} color="#fff" />
              </LinearGradient>
              <Text style={styles.featureTitle}>Hỗ trợ 24/7</Text>
              <Text style={styles.featureDesc}>Tư vấn nhiệt tình, chuyên nghiệp</Text>
            </View>
          </View>
        </View>

        {/* Quote Section - Redesigned */}
        <View style={styles.quoteSection}>
          <LinearGradient
            colors={['#1a1a1a', '#2d2d2d']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quoteGradient}
          >
            <View style={styles.quoteIconWrapper}>
              <Ionicons name="sparkles" size={40} color="#D4AF37" />
            </View>
            <Animated.Text
              style={[
                styles.quoteTextNew,
                {
                  opacity: quoteFadeAnim,
                  transform: [{ translateX: quoteSlideAnim }],
                },
              ]}
            >
              {quotes[currentQuoteIndex]}
            </Animated.Text>
            <View style={styles.quoteDots}>
              {quotes.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.quoteDot,
                    index === currentQuoteIndex && styles.quoteDotActive,
                  ]}
                />
              ))}
            </View>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Explore Button */}
      <View style={styles.bottomSection}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate("PerfumeList")}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#D4AF37', '#C9A227', '#B8941F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.exploreButtonGradient}
            >
              <Text style={styles.exploreButtonText}>Khám phá bộ sưu tập</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
  },
  notificationBadge: {
    position: "absolute",
    right: 2,
    top: 2,
    backgroundColor: "#FF4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1a1a1a",
  },
  notificationText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  // Hero Banner - New
  heroBanner: {
    marginBottom: 0,
  },
  heroGradient: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    width: '100%',
  },
  heroIconContainer: {
    marginBottom: 20,
  },
  heroIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroDivider: {
    width: 60,
    height: 3,
    backgroundColor: '#D4AF37',
    borderRadius: 2,
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  heroButton: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  heroButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 10,
  },
  heroButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  // Stats Section
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#fff',
  },
  statCard: {
    alignItems: 'center',
  },
  statIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  featuredContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#fff',
  },
  sectionHeaderNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF8DC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF8DC',
    borderRadius: 20,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#D4AF37",
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: "#888",
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    marginTop: 16,
  },
  productScrollContainer: {
    paddingRight: 20,
  },
  // Product Cards - New Design
  productCardNew: {
    width: 200,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  productImageContainerNew: {
    width: "100%",
    height: 220,
    position: 'relative',
  },
  imageGradientBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageNew: {
    width: "90%",
    height: "90%",
    resizeMode: "contain",
  },
  productBadgeNew: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
    elevation: 4,
  },
  badgeTextNew: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  productInfoNew: {
    padding: 16,
  },
  productScentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F8F4',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  productScentNew: {
    fontSize: 11,
    color: "#4CAF50",
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  productNameNew: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 8,
    minHeight: 38,
    lineHeight: 20,
  },
  homeRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 4,
  },
  homeStars: {
    flexDirection: "row",
    gap: 1,
  },
  homeRatingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1a1a1a",
    marginLeft: 2,
  },
  homePurchaseCount: {
    fontSize: 10,
    color: "#888",
    marginLeft: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
    fontWeight: '500',
  },
  productPriceNew: {
    fontSize: 18,
    fontWeight: "900",
    color: "#D4AF37",
  },
  addButtonNew: {
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 4,
  },
  addButtonGradientNew: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Why Choose Us Section
  whyChooseContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#f8f9fa',
  },
  whyChooseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
  },
  whyChooseTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 56) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  featureIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 6,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 19,
    fontWeight: '500',
  },
  // Quote Section - Redesigned
  quoteSection: {
    marginHorizontal: 20,
    marginVertical: 30,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  quoteGradient: {
    paddingVertical: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  quoteIconWrapper: {
    marginBottom: 20,
  },
  quoteTextNew: {
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  quoteDots: {
    flexDirection: 'row',
    gap: 8,
  },
  quoteDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  quoteDotActive: {
    backgroundColor: '#D4AF37',
    width: 24,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  exploreButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  exploreButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default HomeScreen;
