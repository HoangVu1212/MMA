import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { useCart } from "../context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';

const CartScreen = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigation = useNavigation();

  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserId(parsedUser._id);
        }
      } catch (error) {
        console.error("Lỗi lấy userId từ AsyncStorage:", error);
      }
    };
    fetchUserId();
  }, []);

  const userCart = cart.filter((item) => item.userId === userId);

  useEffect(() => {
    // Auto-check all items when cart loads
    const allChecked: Record<number, boolean> = {};
    userCart.forEach(item => {
      allChecked[item.id] = true;
    });
    setCheckedItems(allChecked);
  }, [userCart.length]);

  const toggleCheck = (id: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleRemoveItem = (id: number, name: string) => {
    Alert.alert(
      "Xóa sản phẩm",
      `Bạn có chắc chắn muốn xóa ${name}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => removeFromCart(id),
        },
      ]
    );
  };

  const renderItem = ({
    item,
  }: {
    item: {
      id: number;
      name: string;
      image: string;
      price: number;
      stock: number;
      quantity: number;
    };
  }) => {
    const isChecked = checkedItems[item.id] || false;
    return (
      <View style={styles.cartItem}>
        <TouchableOpacity
          onPress={() => toggleCheck(item.id)}
          style={styles.checkbox}
        >
          <View style={[styles.checkboxCircle, isChecked && styles.checkboxChecked]}>
            {isChecked && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("DetailPerfume", { item })}
          style={styles.productContainer}
          activeOpacity={0.8}
        >
          <View style={styles.imageContainer}>
            <Image
              resizeMode="contain"
              source={{ uri: item.image }}
              style={styles.productImage}
            />
          </View>

          <View style={styles.productDetail}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.productPrice}>
              {item.price.toLocaleString('vi-VN')} ₫
            </Text>

            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={() => {
                  if (item.quantity > 1)
                    updateQuantity(item.id, item.quantity - 1);
                }}
                style={[styles.quantityButton, item.quantity === 1 && styles.quantityButtonDisabled]}
                disabled={item.quantity === 1}
              >
                <Ionicons
                  name="remove"
                  size={18}
                  color={item.quantity === 1 ? "#ccc" : "#1a1a1a"}
                />
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{item.quantity}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (item.quantity < item.stock)
                    updateQuantity(item.id, item.quantity + 1);
                }}
                style={[styles.quantityButton, item.quantity >= item.stock && styles.quantityButtonDisabled]}
                disabled={item.quantity >= item.stock}
              >
                <Ionicons
                  name="add"
                  size={18}
                  color={item.quantity >= item.stock ? "#ccc" : "#1a1a1a"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleRemoveItem(item.id, item.name)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={22} color="#FF4444" />
        </TouchableOpacity>
      </View>
    );
  };

  const selectedItems = userCart.filter((item) => checkedItems[item.id]);
  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }
    navigation.navigate("CheckoutScreen", { selectedProducts: selectedItems });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
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
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {userCart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="cart-outline" size={80} color="#ccc" />
          </View>
          <Text style={styles.emptyTitle}>Giỏ hàng của bạn đang trống</Text>
          <Text style={styles.emptyText}>
            Thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate("PerfumeList")}
          >
            <LinearGradient
              colors={['#D4AF37', '#C9A227']}
              style={styles.shopButtonGradient}
            >
              <Text style={styles.shopButtonText}>Khám phá sản phẩm</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartHeaderText}>
              {userCart.length} sản phẩm trong giỏ hàng
            </Text>
            <TouchableOpacity
              onPress={() => {
                const allChecked = userCart.every(item => checkedItems[item.id]);
                const newChecked: Record<number, boolean> = {};
                userCart.forEach(item => {
                  newChecked[item.id] = !allChecked;
                });
                setCheckedItems(newChecked);
              }}
            >
              <Text style={styles.selectAllText}>
                {userCart.every(item => checkedItems[item.id]) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={userCart}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{ height: 200 }} />}
          />

          <View style={styles.footer}>
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tổng tiền:</Text>
                <Text style={styles.totalPrice}>
                  {totalPrice.toLocaleString('vi-VN')} ₫
                </Text>
              </View>
              <Text style={styles.totalItems}>
                {selectedItems.length} sản phẩm đã chọn
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.checkoutButton, selectedItems.length === 0 && styles.checkoutButtonDisabled]}
              onPress={handleCheckout}
              disabled={selectedItems.length === 0}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={selectedItems.length > 0 ? ['#D4AF37', '#C9A227', '#B8941F'] : ['#ccc', '#bbb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.checkoutButtonGradient}
              >
                <Text style={styles.checkoutButtonText}>Thanh toán</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  content: {
    flex: 1,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cartHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },
  listContainer: {
    padding: 16,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  productContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginRight: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productDetail: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#D4AF37",
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityDisplay: {
    minWidth: 40,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  shopButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  shopButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  totalSection: {
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "800",
    color: "#D4AF37",
  },
  totalItems: {
    fontSize: 14,
    color: "#888",
  },
  checkoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checkoutButtonDisabled: {
    elevation: 0,
    shadowOpacity: 0,
  },
  checkoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default CartScreen;
