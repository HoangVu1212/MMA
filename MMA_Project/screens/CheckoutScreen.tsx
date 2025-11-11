import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  StatusBar,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useCart } from "../context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from "../components/config";

const CheckoutScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { removeSelectedItems } = useCart();

  const { selectedProducts = [] } = route.params as {
    selectedProducts?: any[];
  };
  const [shippingAddress, setShippingAddress] = useState<string>("");
  const [selectedVoucher, setSelectedVoucher] = useState<number>(0);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const shippingOptions = [
    { id: 1, name: "Giao hàng tiêu chuẩn", fee: 20000 },
    { id: 2, name: "Giao hàng nhanh", fee: 35000 },
    { id: 3, name: "Giao hàng siêu tốc", fee: 50000 },
  ];
  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0]);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          setShippingAddress("Không tìm thấy dữ liệu người dùng!");
          return;
        }
  
        const parsedData = JSON.parse(userData);
        if (!parsedData.address && parsedData._id) {
          const response = await fetch(`${Config.API_BASE_URL}/api/auth/${parsedData._id}`);
          if (!response.ok) throw new Error("Lỗi khi tải dữ liệu người dùng");
  
          const data = await response.json();
          if (!data.address) {
            setShippingAddress("Chưa có địa chỉ, vui lòng cập nhật!");
            return;
          }
  
          setShippingAddress(data.address);
          parsedData.address = data.address;
          await AsyncStorage.setItem("userData", JSON.stringify(parsedData));
        } else {
          setShippingAddress(parsedData.address);
        }
      } catch (error) {
        console.error("Lỗi khi lấy địa chỉ:", error);
        setShippingAddress("Lỗi khi lấy địa chỉ!");
      }
    };
  
    const unsubscribe = navigation.addListener("focus", fetchAddress);
    return unsubscribe;
  }, [navigation]);
  

  // const shippingFee = 20000;
  const mockVouchers = [
    { id: 1, code: "DISCOUNT10", value: 10000, description: "Giảm 10.000 VND" },
    { id: 2, code: "SALE20", value: 20000, description: "Giảm 20.000 VND" },
    { id: 3, code: "FREESHIP", value: 15000, description: "Giảm 15.000 VND" },
  ];

  const calculateTotal = () => {
    const productTotal = selectedProducts.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    return productTotal + selectedShipping.fee - selectedVoucher;
  };

  const handleConfirmPayment = () => {
    Alert.alert(
      "Xác nhận thanh toán",
      "Bạn có chắc chắn muốn thanh toán không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: () => {
            removeSelectedItems(selectedProducts);
            navigation.navigate("PaymentConfirmation", {
              totalAmount: calculateTotal(),
              selectedProducts: selectedProducts,
            });
          },
        },
      ]
    );
  };

  const productTotal = selectedProducts.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bag-outline" size={20} color="#D4AF37" />
            <Text style={styles.sectionTitle}>Sản phẩm đã chọn</Text>
          </View>
          {selectedProducts.map((item, index) => (
            <View key={item.id}>
              <View style={styles.cartItem}>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item.image }} style={styles.image} />
                </View>
                <View style={styles.details}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.price}>
                    {item.price.toLocaleString()} VND
                  </Text>
                  <View style={styles.quantityBadge}>
                    <Ionicons name="cube-outline" size={14} color="#D4AF37" />
                    <Text style={styles.quantityText}>
                      Số lượng: {item.quantity}
                    </Text>
                  </View>
                </View>
              </View>
              {index < selectedProducts.length - 1 && (
                <View style={styles.divider} />
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color="#D4AF37" />
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
          </View>
          <View style={styles.addressCard}>
            <View style={styles.addressContent}>
              <Ionicons name="home" size={18} color="#D4AF37" />
              <Text style={styles.addressText}>{shippingAddress}</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              style={styles.changeAddressButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#D4AF37', '#F4D03F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.changeButtonGradient}
              >
                <Text style={styles.changeAddressText}>Thay đổi</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="car-outline" size={20} color="#D4AF37" />
            <Text style={styles.sectionTitle}>Chọn dịch vụ giao hàng</Text>
          </View>
          {shippingOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.shippingOption,
                selectedShipping.id === option.id && styles.selectedShipping,
              ]}
              onPress={() => setSelectedShipping(option)}
              activeOpacity={0.8}
            >
              <View style={styles.shippingContent}>
                <View style={styles.shippingLeft}>
                  <Ionicons 
                    name={selectedShipping.id === option.id ? "radio-button-on" : "radio-button-off"} 
                    size={20} 
                    color={selectedShipping.id === option.id ? "#D4AF37" : "#666"} 
                  />
                  <Text style={[
                    styles.shippingText,
                    selectedShipping.id === option.id && styles.selectedShippingText
                  ]}>
                    {option.name}
                  </Text>
                </View>
                <Text style={[
                  styles.shippingFee,
                  selectedShipping.id === option.id && styles.selectedShippingFee
                ]}>
                  {option.fee.toLocaleString()} VND
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chọn mã giảm giá */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="ticket-outline" size={20} color="#D4AF37" />
            <Text style={styles.sectionTitle}>Mã giảm giá</Text>
          </View>
          <TouchableOpacity
            style={styles.voucherButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.voucherContent}>
              <Ionicons 
                name={selectedVoucher > 0 ? "ticket" : "ticket-outline"} 
                size={20} 
                color={selectedVoucher > 0 ? "#D4AF37" : "#999"} 
              />
              <Text style={[
                styles.voucherText,
                selectedVoucher > 0 && styles.voucherTextActive
              ]}>
                {selectedVoucher > 0
                  ? `Giảm ${selectedVoucher.toLocaleString()} VND`
                  : "Chọn mã giảm giá"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={20} color="#D4AF37" />
            <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          </View>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng giá trị sản phẩm:</Text>
              <Text style={styles.summaryValue}>{productTotal.toLocaleString()} VND</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
              <Text style={styles.summaryValue}>{selectedShipping.fee.toLocaleString()} VND</Text>
            </View>
            {selectedVoucher > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Giảm giá:</Text>
                <Text style={styles.discountValue}>-{selectedVoucher.toLocaleString()} VND</Text>
              </View>
            )}
            <View style={styles.totalDivider} />
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Tổng cộng:</Text>
              <Text style={styles.totalPrice}>
                {calculateTotal().toLocaleString()} VND
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleConfirmPayment}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#D4AF37', '#F4D03F', '#D4AF37']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.checkoutGradient}
          >
            <Ionicons name="card" size={20} color="#1a1a1a" />
            <Text style={styles.checkoutText}>Xác nhận thanh toán</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      </LinearGradient>

      {/* Modal chọn voucher */}
      <Modal transparent={true} visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn mã giảm giá</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {mockVouchers.map((voucher) => (
                <TouchableOpacity
                  key={voucher.id}
                  style={[
                    styles.voucherItem,
                    selectedVoucher === voucher.value && styles.selectedVoucherItem
                  ]}
                  onPress={() => {
                    setSelectedVoucher(voucher.value);
                    setModalVisible(false);
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={selectedVoucher === voucher.value 
                      ? ['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.1)']
                      : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
                    }
                    style={styles.voucherGradient}
                  >
                    <View style={styles.voucherItemContent}>
                      <View style={styles.voucherLeft}>
                        <Ionicons 
                          name="ticket" 
                          size={24} 
                          color={selectedVoucher === voucher.value ? "#D4AF37" : "#999"} 
                        />
                        <View style={styles.voucherInfo}>
                          <Text style={styles.voucherCode}>{voucher.code}</Text>
                          <Text style={styles.voucherDescription}>
                            {voucher.description || "Không có mô tả"}
                          </Text>
                        </View>
                      </View>
                      {selectedVoucher === voucher.value && (
                        <Ionicons name="checkmark-circle" size={24} color="#D4AF37" />
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#1a1a1a" 
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: StatusBar.currentHeight || 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: { 
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "800", 
    color: "#fff",
    letterSpacing: 0.5,
  },
  scrollContainer: { 
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: { 
    fontSize: 17, 
    fontWeight: "700", 
    color: "#fff",
    letterSpacing: 0.3,
  },

  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  imageContainer: {
    marginRight: 12,
  },
  image: { 
    width: 70, 
    height: 70, 
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  details: { 
    flex: 1,
  },
  productName: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#fff",
    marginBottom: 6,
  },
  price: { 
    fontSize: 15, 
    color: "#D4AF37",
    fontWeight: "600",
    marginBottom: 8,
  },
  quantityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  quantityText: { 
    fontSize: 13, 
    color: "#D4AF37",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 8,
  },

  addressCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  addressContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  addressText: { 
    fontSize: 14, 
    flex: 1,
    color: "#fff",
    lineHeight: 20,
  },
  changeAddressButton: {
    borderRadius: 10,
    overflow: "hidden",
  },
  changeButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  changeAddressText: { 
    color: "#1a1a1a", 
    fontSize: 14,
    fontWeight: "700",
  },

  summaryContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    padding: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#ccc",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  discountValue: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  totalDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 12,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalText: { 
    fontSize: 18, 
    fontWeight: "700",
    color: "#fff",
  },
  totalPrice: { 
    fontSize: 20, 
    fontWeight: "800", 
    color: "#D4AF37",
    letterSpacing: 0.5,
  },

  footer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  checkoutButton: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  checkoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  checkoutText: { 
    color: "#1a1a1a", 
    fontSize: 17, 
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  voucherItem: { 
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  voucherButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "rgba(212, 175, 55, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  voucherContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  voucherText: { 
    fontSize: 15, 
    color: "#999",
    fontWeight: "500",
  },
  voucherTextActive: {
    color: "#D4AF37",
    fontWeight: "600",
  },
  voucherCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#27ae60",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  shippingOption: {
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  selectedShipping: {
    borderColor: "#D4AF37",
    backgroundColor: "rgba(212, 175, 55, 0.15)",
  },
  shippingContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shippingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  shippingText: {
    fontSize: 15,
    color: "#ccc",
    fontWeight: "500",
  },
  selectedShippingText: {
    color: "#fff",
    fontWeight: "600",
  },
  shippingFee: {
    fontSize: 15,
    color: "#999",
    fontWeight: "600",
  },
  selectedShippingFee: {
    color: "#D4AF37",
    fontWeight: "700",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: { 
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    maxHeight: "70%",
    borderTopWidth: 2,
    borderTopColor: "#D4AF37",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: "800", 
    color: "#fff",
    letterSpacing: 0.5,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedVoucherItem: {
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  voucherGradient: {
    padding: 16,
    borderRadius: 12,
  },
  voucherItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  voucherLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  voucherInfo: {
    flex: 1,
  },
  voucherDescription: {
    fontSize: 13,
    color: "#ccc",
  },
});

export default CheckoutScreen;
