import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PerfumeList from "../components/PerfumeList";
import DetailPerfume from "../components/DetailPerfume";
import CartScreen from "../screens/CartScreen";
import Login from "../components/Login";
import Register from "../components/Register";
import ProfileScreen from "../components/ProfileScreen";
import HomeScreen from "../components/HomePage";
import { CartProvider, useCart } from "../context/CartContext";
import { FavoritesProvider, useFavorites } from "../context/FavoritesContext";
import { OrdersProvider } from "../context/OrdersContext";
import { LoadingProvider } from "../context/LoadingContext";
import { UserProvider, useUser } from "../context/UserContext";
import CheckoutScreen from "../screens/CheckoutScreen";
import { PaymentConfirmationScreen } from "../screens/PaymentConfirmationScreen";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import MapScreen from "../screens/MapScreen";
import { ChatScreen } from "../screens/ChatScreen";
import ForgotPassword from "../components/ForgotPassword";
import FavoritesScreen from "../screens/FavoritesScreen";
import OrderHistoryScreen from "../screens/OrderHistoryScreen";

interface UserData {
  name: string;
  email: string;
  phone: string;
  dob: string;
  address?: string;
  avatar?: string;
}

type RootStackParamList = {
  Login: { email?: string };
  Main: undefined;
  DetailPerfume: undefined;
  CartScreen: undefined;
  CheckoutScreen: undefined;
  PaymentConfirmation: undefined;
  Profile: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

type DrawerParamList = {
  Home: undefined;
  PerfumeList: undefined;
  DetailPerfume: undefined;
  CartScreen: undefined;
  CheckoutScreen: undefined;
  PaymentConfirmation: undefined;
  Profile: undefined;
  MapScreen: undefined;
  ChatScreen: undefined;
  Favorites: undefined;
  OrderHistory: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

const CustomDrawerContent = (props: any) => {
  const { userData, logout } = useUser();
  const { cart } = useCart();
  const { favorites } = useFavorites();
  const { userId } = useUser();

  const cartItemCount = cart.filter((item) => item.userId === userId).length;
  const favoritesCount = favorites.filter((item) => item.userId === userId).length;

  const handleLogout = async () => {
    try {
      await logout();
      props.navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const getDefaultAvatar = (userName: string) => {
    const initials = userName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=D4AF37&color=fff&size=200&bold=true`;
  };


  return (
    <View style={drawerStyles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        style={drawerStyles.gradient}
      >
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={drawerStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Profile Section */}
          <View style={drawerStyles.profileSection}>
            <View style={drawerStyles.avatarWrapper}>
              <View style={drawerStyles.avatarContainer}>
                <Image
                  source={{
                    uri: userData?.avatar || getDefaultAvatar(userData?.name || "User")
                  }}
                  style={drawerStyles.avatar}
                />
                <View style={drawerStyles.avatarBorder} />
              </View>
            </View>
            <View style={drawerStyles.userInfo}>
              <Text style={drawerStyles.greetingText}>Xin chào,</Text>
              <Text style={drawerStyles.userName} numberOfLines={1}>
                {userData?.name || "Người dùng"}
              </Text>
              <Text style={drawerStyles.userEmail} numberOfLines={1}>
                {userData?.email || ""}
              </Text>
            </View>
          </View>

          {/* Menu Items */}
          <View style={drawerStyles.menuSection}>
            <DrawerItemList {...props} />
          </View>
        </DrawerContentScrollView>

        {/* Logout Button */}
        <View style={drawerStyles.footer}>
          <TouchableOpacity
            style={drawerStyles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#D4AF37', '#F4D03F', '#D4AF37']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={drawerStyles.logoutGradient}
            >
              <Ionicons name="log-out-outline" size={20} color="#1a1a1a" />
              <Text style={drawerStyles.logoutText}>Đăng xuất</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const MainDrawer = () => {
  const { cart } = useCart();
  const { favorites } = useFavorites();
  const { userId } = useUser();

  const cartItemCount = cart.filter((item) => item.userId === userId).length;
  const favoritesCount = favorites.filter((item) => item.userId === userId).length;

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: "#D4AF37",
        drawerInactiveTintColor: "#ccc",
        drawerStyle: {
          backgroundColor: "transparent",
          width: 280,
        },
        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 4,
          marginVertical: 2,
          paddingLeft: 6,
          paddingRight: 8,
          paddingVertical: 3,
        },
        drawerActiveBackgroundColor: "rgba(212, 175, 55, 0.2)",
        drawerLabelStyle: {
          fontSize: 13,
          fontWeight: "600",
          marginLeft: 2,
          flex: 1,
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Trang chủ",
          headerShown: false,
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={size * 0.9} 
              color={color} 
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Hồ sơ cá nhân",
          headerShown: false,
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={size * 0.9} 
              color={color} 
            />
          ),
        }}
      />
      <Drawer.Screen
        name="PerfumeList"
        component={PerfumeList}
        options={{
          title: "Danh sách nước hoa",
          drawerLabel: "Danh sách nước hoa",
          headerShown: false,
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "flower" : "flower-outline"} 
              size={20} 
              color={color} 
            />
          ),
        }}
      />
      <Drawer.Screen
        name="CartScreen"
        component={CartScreen}
        options={{
          title: "Giỏ hàng",
          headerShown: false,
          drawerIcon: ({ color, size, focused }) => (
            <View style={{ flexDirection: "row", alignItems: "center", position: "relative" }}>
              <Ionicons 
                name={focused ? "cart" : "cart-outline"} 
                size={size * 0.9} 
                color={color} 
              />
              {cartItemCount > 0 && (
                <View style={drawerStyles.badge}>
                  <Text style={drawerStyles.badgeText}>{cartItemCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="CheckoutScreen"
        component={CheckoutScreen}
        options={{ 
          drawerItemStyle: { display: "none" },
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="PaymentConfirmation"
        component={PaymentConfirmationScreen}
        options={{ 
          drawerItemStyle: { display: "none" },
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="DetailPerfume"
        component={DetailPerfume}
        options={{ 
          drawerItemStyle: { display: "none" },
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="MapScreen"
        component={MapScreen}
        options={{
          title: "Bản đồ",
          headerShown: false,
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "map" : "map-outline"} 
              size={size * 0.9} 
              color={color} 
            />
          ),
        }}
      />
      <Drawer.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{
          title: "Chat",
          headerShown: false,
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "chatbubble" : "chatbubble-outline"} 
              size={size * 0.9} 
              color={color} 
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: "Yêu thích",
          headerShown: false,
          drawerIcon: ({ color, size, focused }) => (
            <View style={{ flexDirection: "row", alignItems: "center", position: "relative" }}>
              <Ionicons 
                name={focused ? "heart" : "heart-outline"} 
                size={size * 0.9} 
                color={color} 
              />
              {favoritesCount > 0 && (
                <View style={drawerStyles.badge}>
                  <Text style={drawerStyles.badgeText}>{favoritesCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{
          title: "Lịch sử mua hàng",
          drawerLabel: "Lịch sử mua hàng",
          headerShown: false,
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "time" : "time-outline"} 
              size={20} 
              color={color} 
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

// Login Wrapper Component to avoid inline function warning
const LoginWrapper = (props: any) => {
  const handleLoginSuccess = (data: UserData) => {
    console.log("Login success with data:", data);
    props.navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  };

  return <Login {...props} onLoginSuccess={handleLoginSuccess} />;
};

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        console.log("User data from AsyncStorage:", userData);
        setIsLoggedIn(!!userData);
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);

  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <LoadingProvider>
          <CartProvider>
            <FavoritesProvider>
              <OrdersProvider>
                <NavigationContainer>
                  <Stack.Navigator
                    initialRouteName={isLoggedIn ? "Main" : "Login"}
                    screenOptions={{ headerShown: false }}
                  >
                    <Stack.Screen
                      name="Login"
                      component={LoginWrapper}
                    />
                    <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
                    <Stack.Screen name="Register" component={Register} />
                    <Stack.Screen name="Main" component={MainDrawer} />
                    <Stack.Screen name="DetailPerfume" component={DetailPerfume} />
                    <Stack.Screen name="CartScreen" component={CartScreen} />
                    <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
                    <Stack.Screen
                      name="PaymentConfirmation"
                      component={PaymentConfirmationScreen}
                    />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                  </Stack.Navigator>
                </NavigationContainer>
              </OrdersProvider>
            </FavoritesProvider>
          </CartProvider>
        </LoadingProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
};

const drawerStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileSection: {
    paddingTop: StatusBar.currentHeight || 30,
    paddingBottom: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 8,
  },
  avatarWrapper: {
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarBorder: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 37,
    borderWidth: 2,
    borderColor: "#D4AF37",
  },
  userInfo: {
    alignItems: "center",
  },
  greetingText: {
    fontSize: 12,
    color: "#ccc",
    marginBottom: 4,
    fontWeight: "500",
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    letterSpacing: 0.3,
    textAlign: "center",
  },
  userEmail: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
  },
  menuSection: {
    flex: 1,
    paddingTop: 2,
    paddingHorizontal: 2,
  },
  footer: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === "ios" ? 25 : 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  logoutButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  logoutText: {
    color: "#1a1a1a",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#1a1a1a",
    elevation: 4,
    shadowColor: "#FF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
});

export default AppNavigator;
