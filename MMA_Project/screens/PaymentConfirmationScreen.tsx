import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
} from "react-native";
import { useNavigation, useRoute, NavigationProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons/build/Icons";
import { LinearGradient } from "expo-linear-gradient";
import { useOrders } from "../context/OrdersContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RootStackParamList = {
  Home: undefined;
  Main: undefined;
  OrderHistory: undefined;
  PerfumeList: undefined;
};

const PaymentConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { totalAmount, selectedProducts } = route.params as { 
    totalAmount: number; 
    selectedProducts?: any[];
  };
  const { addOrder } = useOrders();
  const [orderId, setOrderId] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Tạo mã đơn hàng ngẫu nhiên (6 chữ số)
    const generateOrderId = () => Math.floor(100000 + Math.random() * 900000).toString();
  
    // Lấy ngày hiện tại
    const getCurrentDate = () => {
      const date = new Date();
      return date.toLocaleDateString("vi-VN"); // Format ngày theo Việt Nam
    };
  
    const newOrderId = generateOrderId();
    const newOrderDate = getCurrentDate();
    
    setOrderId(newOrderId);
    setOrderDate(newOrderDate);

    // Lưu đơn hàng vào OrdersContext
    saveOrderToHistory(newOrderId, newOrderDate);
  }, []);

  const saveOrderToHistory = async (orderIdValue: string, orderDateValue: string) => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) return;

      const parsedUserData = JSON.parse(userData);
      const userId = parsedUserData._id;

      // Tạo order object
      const order = {
        orderId: orderIdValue,
        orderDate: orderDateValue,
        totalAmount: typeof totalAmount === 'number' ? totalAmount : parseFloat(totalAmount),
        status: "pending" as const,
        products: selectedProducts?.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })) || [],
        userId: userId,
        deliveryAddress: parsedUserData.address || "",
      };

      // Thêm vào OrdersContext
      addOrder(order);
      console.log("Order saved to history:", order);
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon với Animation */}
        <Animated.View 
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.successCircle}
          >
            <Ionicons name="checkmark" size={80} color="#fff" />
          </LinearGradient>
        </Animated.View>

        {/* Header Text */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.headerTitle}>Đặt hàng thành công!</Text>
          <Text style={styles.subHeader}>
            Cảm ơn bạn đã mua hàng tại cửa hàng của chúng tôi
          </Text>
        </Animated.View>

        {/* Order Details Card */}
        <Animated.View style={[styles.orderCard, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.cardGradient}
          >
            {/* Delivery Time */}
            <View style={styles.infoRow}>
              <View style={styles.iconBadge}>
                <Ionicons name="time-outline" size={24} color="#D4AF37" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Thời gian giao hàng</Text>
                <Text style={styles.infoValue}>3-5 ngày làm việc</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Order ID */}
            <View style={styles.infoRow}>
              <View style={styles.iconBadge}>
                <Ionicons name="receipt-outline" size={24} color="#D4AF37" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Mã đơn hàng</Text>
                <Text style={styles.infoValue}>{orderId}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Order Date */}
            <View style={styles.infoRow}>
              <View style={styles.iconBadge}>
                <Ionicons name="calendar-outline" size={24} color="#D4AF37" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày đặt hàng</Text>
                <Text style={styles.infoValue}>{orderDate}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Total Amount */}
            <View style={styles.totalSection}>
              <LinearGradient
                colors={['#D4AF37', '#F4D03F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.totalBadge}
              >
                <Ionicons name="cash-outline" size={28} color="#1a1a1a" />
                <View style={styles.totalContent}>
                  <Text style={styles.totalLabel}>Tổng cộng</Text>
                  <Text style={styles.totalAmount}>
                    {typeof totalAmount === 'number' 
                      ? totalAmount.toLocaleString('vi-VN') 
                      : totalAmount} VNĐ
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Delivery Timeline */}
        <Animated.View style={[styles.timelineCard, { opacity: fadeAnim }]}>
          <Text style={styles.timelineTitle}>Quy trình giao hàng</Text>
          
          <View style={styles.timelineItem}>
            <View style={styles.timelineIconActive}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTextActive}>Đơn hàng đã xác nhận</Text>
              <Text style={styles.timelineDate}>Hôm nay</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Ionicons name="cube-outline" size={24} color="#888" />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineText}>Đang đóng gói</Text>
              <Text style={styles.timelineDate}>1-2 ngày</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Ionicons name="car-outline" size={24} color="#888" />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineText}>Đang vận chuyển</Text>
              <Text style={styles.timelineDate}>2-4 ngày</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Ionicons name="home-outline" size={24} color="#888" />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineText}>Đã giao hàng</Text>
              <Text style={styles.timelineDate}>3-5 ngày</Text>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Main" }],
              });
            }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#D4AF37', '#F4D03F', '#D4AF37']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="home" size={22} color="#1a1a1a" />
              <Text style={styles.buttonTextPrimary}>Về trang chủ</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [
                    { 
                      name: "Main",
                      params: { screen: "OrderHistory" }
                    }
                  ],
                });
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="receipt-outline" size={20} color="#fff" />
              <Text style={styles.buttonTextSecondary}>Xem đơn hàng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [
                    { 
                      name: "Main",
                      params: { screen: "PerfumeList" }
                    }
                  ],
                });
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="bag-add-outline" size={20} color="#fff" />
              <Text style={styles.buttonTextSecondary}>Tiếp tục mua</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // Success Icon Section
  iconContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  successCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  // Header Section
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subHeader: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  // Order Card
  orderCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cardGradient: {
    padding: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: "#999",
    marginBottom: 4,
    letterSpacing: 0.3,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 8,
  },
  // Total Section
  totalSection: {
    marginTop: 12,
  },
  totalBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
  },
  totalContent: {
    marginLeft: 16,
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
  // Timeline Section
  timelineCard: {
    backgroundColor: "#2d2d2d",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  timelineIconActive: {
    marginRight: 16,
  },
  timelineIcon: {
    marginRight: 16,
    opacity: 0.5,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTextActive: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 4,
  },
  timelineText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#aaa",
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 12,
    color: "#666",
  },
  timelineLine: {
    width: 2,
    height: 30,
    backgroundColor: "#444",
    marginLeft: 12,
    marginVertical: 4,
  },
  // Buttons Section
  buttonContainer: {
    marginTop: 8,
  },
  buttonPrimary: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  buttonTextPrimary: {
    color: "#1a1a1a",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  buttonSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2d2d2d",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#444",
  },
  buttonTextSecondary: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export { PaymentConfirmationScreen };
