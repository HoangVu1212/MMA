import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useOrders } from "../context/OrdersContext";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const OrderHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { orders, getUserOrders } = useOrders();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const userOrders = userId ? getUserOrders(userId) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FF9800";
      case "processing":
        return "#2196F3";
      case "delivered":
        return "#4CAF50";
      case "cancelled":
        return "#F44336";
      default:
        return "#999";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "processing":
        return "Đang giao";
      case "delivered":
        return "Đã giao";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const renderOrderItem = ({ item }: any) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Ionicons name="receipt-outline" size={20} color="#D4AF37" />
          <Text style={styles.orderId}>#{item.orderId}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.orderDate}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cube-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {item.products.length} sản phẩm
          </Text>
        </View>
      </View>

      {/* Product Preview */}
      <View style={styles.productsPreview}>
        {item.products.slice(0, 3).map((product: any, index: number) => (
          <Image
            key={index}
            source={{ uri: product.image }}
            style={styles.productPreviewImage}
          />
        ))}
        {item.products.length > 3 && (
          <View style={styles.moreProductsBadge}>
            <Text style={styles.moreProductsText}>
              +{item.products.length - 3}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalAmount}>
            {item.totalAmount.toLocaleString()} VNĐ
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.detailButton}
          onPress={() => {
            setSelectedOrder(item);
            setModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.detailButtonText}>Chi tiết</Text>
          <Ionicons name="chevron-forward" size={16} color="#D4AF37" />
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
          <Text style={styles.headerTitle}>LỊCH SỬ</Text>
          <Text style={styles.headerSubtitle}>
            {userOrders.length} đơn hàng
          </Text>
        </View>
        <View style={{ width: 48 }} />
      </LinearGradient>

      {/* Content */}
      {userOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={100} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
          <Text style={styles.emptySubtext}>
            Lịch sử đơn hàng của bạn sẽ hiển thị tại đây
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
              <Ionicons name="cart" size={20} color="#1a1a1a" />
              <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={userOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.orderId}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Order Detail Modal - Redesigned */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <LinearGradient
                  colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalHeader}
                >
                  <View style={styles.modalHeaderContent}>
                    <View style={styles.modalIconContainer}>
                      <LinearGradient
                        colors={["#D4AF37", "#F4D03F"]}
                        style={styles.modalIconCircle}
                      >
                        <Ionicons name="receipt" size={32} color="#1a1a1a" />
                      </LinearGradient>
                    </View>
                    <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
                    <Text style={styles.modalOrderId}>#{selectedOrder.orderId}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.8)" />
                  </TouchableOpacity>
                </LinearGradient>

                {/* Status Card - Redesigned */}
                <View style={styles.modalBody}>
                  <View style={styles.statusCard}>
                    <View style={styles.statusCardContent}>
                      <View style={styles.statusIconWrapper}>
                        <LinearGradient
                          colors={
                            selectedOrder.status === "delivered"
                              ? ["#4CAF50", "#45a049"]
                              : selectedOrder.status === "processing"
                              ? ["#2196F3", "#1976D2"]
                              : selectedOrder.status === "cancelled"
                              ? ["#F44336", "#D32F2F"]
                              : ["#FF9800", "#F57C00"]
                          }
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.statusIconGradient}
                        >
                          <Ionicons 
                            name={
                              selectedOrder.status === "delivered" ? "checkmark-circle" :
                              selectedOrder.status === "processing" ? "rocket" :
                              selectedOrder.status === "cancelled" ? "close-circle" :
                              "time-outline"
                            } 
                            size={32} 
                            color="#fff" 
                          />
                        </LinearGradient>
                      </View>

                      
                      <View style={styles.statusTextContent}>
                        <Text style={styles.statusLabel}>Trạng thái đơn hàng</Text>
                        <Text style={styles.statusValue}>
                          {getStatusText(selectedOrder.status)}
                        </Text>
                        <View style={styles.statusTimeline}>
                          <View style={[
                            styles.timelineDot,
                            { backgroundColor: getStatusColor(selectedOrder.status) }
                          ]} />
                          <Text style={styles.statusDescription}>
                            {selectedOrder.status === "delivered" 
                              ? "Đơn hàng đã được giao thành công"
                              : selectedOrder.status === "processing"
                              ? "Đơn hàng đang trên đường giao đến bạn"
                              : selectedOrder.status === "cancelled"
                              ? "Đơn hàng đã bị hủy"
                              : "Đơn hàng đang được xử lý"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Info Cards Grid */}
                  <View style={styles.infoCardsGrid}>
                    <View style={styles.infoCardSmall}>
                      <View style={styles.infoCardIconBg}>
                        <Ionicons name="calendar" size={20} color="#D4AF37" />
                      </View>
                      <Text style={styles.infoCardLabel}>Ngày đặt</Text>
                      <Text style={styles.infoCardValue}>{selectedOrder.orderDate}</Text>
                    </View>
                    <View style={styles.infoCardSmall}>
                      <View style={styles.infoCardIconBg}>
                        <Ionicons name="cube" size={20} color="#D4AF37" />
                      </View>
                      <Text style={styles.infoCardLabel}>Sản phẩm</Text>
                      <Text style={styles.infoCardValue}>{selectedOrder.products.length} món</Text>
                    </View>
                  </View>

                  {/* Address Card */}
                  <View style={styles.addressCard}>
                    <View style={styles.addressHeader}>
                      <Ionicons name="location" size={22} color="#D4AF37" />
                      <Text style={styles.addressTitle}>Địa chỉ giao hàng</Text>
                    </View>
                    <Text style={styles.addressText}>
                      {selectedOrder.deliveryAddress || "Chưa có địa chỉ giao hàng"}
                    </Text>
                  </View>

                  {/* Products Section */}
                  <View style={styles.productsSection}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="bag-handle" size={22} color="#1a1a1a" />
                      <Text style={styles.sectionTitle}>Sản phẩm đã đặt</Text>
                    </View>
                    {selectedOrder.products.map((product: any, index: number) => (
                      <View key={index} style={styles.productCard}>
                        <View style={styles.productImageContainer}>
                          <Image
                            source={{ uri: product.image }}
                            style={styles.modalProductImage}
                          />
                          <View style={styles.productQuantityBadge}>
                            <Text style={styles.productQuantityText}>x{product.quantity}</Text>
                          </View>
                        </View>
                        <View style={styles.modalProductInfo}>
                          <Text style={styles.modalProductName} numberOfLines={2}>
                            {product.name}
                          </Text>
                          <View style={styles.productPriceRow}>
                            <Text style={styles.productPriceLabel}>Đơn giá:</Text>
                            <Text style={styles.modalProductPrice}>
                              {product.price.toLocaleString()} ₫
                            </Text>
                          </View>
                          <View style={styles.productPriceRow}>
                            <Text style={styles.productPriceLabel}>Thành tiền:</Text>
                            <Text style={styles.productTotalPrice}>
                              {(product.price * product.quantity).toLocaleString()} ₫
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Total Card */}
                  <View style={styles.totalCardWrapper}>
                    <LinearGradient
                      colors={["#1a1a1a", "#2d2d2d"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.modalTotalCard}
                    >
                      <View style={styles.totalRow}>
                        <Text style={styles.totalRowLabel}>Tạm tính:</Text>
                        <Text style={styles.totalRowValue}>
                          {selectedOrder.totalAmount.toLocaleString()} ₫
                        </Text>
                      </View>
                      <View style={styles.totalRow}>
                        <Text style={styles.totalRowLabel}>Phí vận chuyển:</Text>
                        <Text style={styles.totalRowValue}>Miễn phí</Text>
                      </View>
                      <View style={styles.totalDivider} />
                      <View style={styles.finalTotalRow}>
                        <View>
                          <Text style={styles.finalTotalLabel}>TỔNG THANH TOÁN</Text>
                          <Text style={styles.finalTotalNote}>Đã bao gồm VAT</Text>
                        </View>
                        <LinearGradient
                          colors={["#D4AF37", "#F4D03F"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.finalTotalBadge}
                        >
                          <Text style={styles.modalTotalAmount}>
                            {selectedOrder.totalAmount.toLocaleString()} ₫
                          </Text>
                        </LinearGradient>
                      </View>
                    </LinearGradient>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  orderInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
  },
  productsPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  productPreviewImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  moreProductsBadge: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  moreProductsText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#D4AF37",
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFF8DC",
    borderRadius: 12,
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D4AF37",
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
  // Modal Styles - Redesigned
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "95%",
    elevation: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  modalHeader: {
    padding: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 28,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  modalHeaderContent: {
    alignItems: "center",
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  modalOrderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D4AF37",
    letterSpacing: 0.5,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
  },
  modalBody: {
    padding: 20,
    paddingTop: 0,
  },
  // Status Card - Redesigned
  statusCard: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  statusCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  statusIconWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
  },
  statusIconGradient: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  statusTextContent: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  statusValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  statusTimeline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDescription: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
    flex: 1,
    lineHeight: 18,
  },
  // Info Cards Grid
  infoCardsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  infoCardSmall: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  infoCardIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF8DC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  infoCardLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    marginBottom: 6,
  },
  infoCardValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
  },
  // Address Card
  addressCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#D4AF37",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  addressTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  addressText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginLeft: 32,
  },
  // Products Section
  productsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: 0.3,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  productImageContainer: {
    position: "relative",
  },
  modalProductImage: {
    width: 85,
    height: 85,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  productQuantityBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#D4AF37",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    elevation: 4,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  productQuantityText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  modalProductInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  modalProductName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 10,
    lineHeight: 20,
  },
  productPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  productPriceLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  modalProductPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  productTotalPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#D4AF37",
  },
  // Total Card
  totalCardWrapper: {
    marginBottom: 24,
  },
  modalTotalCard: {
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  totalRowLabel: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  totalRowValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  totalDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 16,
  },
  finalTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  finalTotalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#D4AF37",
    letterSpacing: 1,
    marginBottom: 4,
  },
  finalTotalNote: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
  },
  finalTotalBadge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    elevation: 6,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  modalTotalAmount: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
});

export default OrderHistoryScreen;

