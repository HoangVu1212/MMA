import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../context/UserContext";

interface StoreLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
}

const STORES: StoreLocation[] = [
  {
    id: "1",
    name: "Cửa hàng nước hoa chính",
    address: "116 Trần Hưng Đạo, Phường Cẩm Phô, Hội An, Quảng Nam",
    latitude: 15.879699,
    longitude: 108.323989,
    phone: "0914 733 450",
  },
  {
    id: "2",
    name: "Chi nhánh Đà Nẵng",
    address: "123 Nguyễn Văn Linh, Đà Nẵng",
    latitude: 16.0544,
    longitude: 108.2022,
    phone: "0236 9876 543",
  },
  {
    id: "3",
    name: "Chi nhánh Hà Nội",
    address: "456 Hoàng Hoa Thám, Hà Nội",
    latitude: 21.0285,
    longitude: 105.8542,
    phone: "024 1234 5678",
  },
];

const MapScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userData } = useUser();
  const mapRef = useRef<MapView>(null);
  const webViewRef = useRef<WebView>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");
  const [mapError, setMapError] = useState(false);
  const [useWebView, setUseWebView] = useState(true); // Use WebView with Leaflet by default
  const [mapKey, setMapKey] = useState(0); // Key to force WebView reload
  const [region, setRegion] = useState<Region>({
    latitude: 15.879699,
    longitude: 108.323989,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    // Always use WebView with Leaflet for free maps
    setUseWebView(true);
    requestLocationPermission();
  }, []);

  // Reload map when user location changes
  useEffect(() => {
    if (useWebView && userLocation) {
      setMapKey(prev => prev + 1);
    }
  }, [userLocation, useWebView]);

  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      
      // Check if Location module is available
      if (!Location) {
        console.warn("Location module not available");
        setLoading(false);
        return;
      }
      
      // Check if location services are enabled
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      let finalStatus = existingStatus;

      // If permission not granted, request it
      if (existingStatus !== "granted") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Quyền truy cập vị trí",
          "Ứng dụng cần quyền truy cập vị trí để hiển thị vị trí của bạn trên bản đồ.",
          [{ text: "OK" }]
        );
        setLoading(false);
        return;
      }

      // Get current location
      await getCurrentLocation();
    } catch (error: any) {
      console.error("Error requesting location permission:", error);
      Alert.alert(
        "Lỗi",
        error?.message || "Không thể truy cập vị trí. Vui lòng kiểm tra cài đặt của bạn."
      );
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
      
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      
      setRegion(newRegion);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Lỗi",
        error.message || "Không thể lấy vị trí hiện tại. Vui lòng kiểm tra cài đặt vị trí của bạn."
      );
      setLoading(false);
    }
  };

  const handleStorePress = (store: StoreLocation) => {
    setSelectedStore(store);
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: store.latitude,
        longitude: store.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleCallStore = (phone: string) => {
    Alert.alert("Gọi cửa hàng", `Bạn có muốn gọi đến ${phone}?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Gọi",
        onPress: () => {
          // In a real app, you would use Linking.openURL(`tel:${phone}`)
          Alert.alert("Thông báo", `Đang gọi đến ${phone}`);
        },
      },
    ]);
  };

  const handleGetDirections = (store: StoreLocation) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
    Alert.alert(
      "Chỉ đường",
      `Mở Google Maps để chỉ đường đến ${store.name}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Mở",
          onPress: () => {
            // In a real app, you would use Linking.openURL(url)
            Alert.alert("Thông báo", "Đang mở Google Maps...");
          },
        },
      ]
    );
  };

  const toggleMapType = () => {
    setMapType(mapType === "standard" ? "satellite" : "standard");
  };

  const generateMapHTML = () => {
    const storesJSON = JSON.stringify(STORES);
    const userLocJSON = userLocation ? JSON.stringify(userLocation) : 'null';
    const centerLat = userLocation ? userLocation.latitude : region.latitude;
    const centerLng = userLocation ? userLocation.longitude : region.longitude;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
        .leaflet-container { background: #2d2d2d; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        const stores = ${storesJSON};
        const userLocation = ${userLocJSON};
        const centerLat = ${centerLat};
        const centerLng = ${centerLng};

        // Initialize map
        var map = L.map('map').setView([centerLat, centerLng], 13);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add user location marker if available
        if (userLocation) {
            var userIcon = L.divIcon({
                className: 'user-marker',
                html: '<div style="background-color: #2196F3; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
            L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
                .addTo(map)
                .bindPopup('Vị trí của bạn');
        }

        // Add store markers
        stores.forEach(store => {
            var storeIcon = L.divIcon({
                className: 'store-marker',
                html: '<div style="background: linear-gradient(135deg, #D4AF37, #F4D03F); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><span style="font-size: 20px;">🏪</span></div>',
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });
            
            var marker = L.marker([store.latitude, store.longitude], { icon: storeIcon })
                .addTo(map)
                .bindPopup('<b>' + store.name + '</b><br>' + store.address);
            
            marker.on('click', function() {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'store_click',
                        storeId: store.id
                    }));
                }
            });
        });

        // Fit map to show all markers
        var group = new L.featureGroup(stores.map(store => 
            L.marker([store.latitude, store.longitude])
        ));
        if (userLocation) {
            group.addLayer(L.marker([userLocation.latitude, userLocation.longitude]));
        }
        if (group.getLayers().length > 0) {
            map.fitBounds(group.getBounds().pad(0.1));
        }
    </script>
</body>
</html>
    `;
  };

  const focusOnUserLocation = () => {
    if (userLocation) {
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } else {
      getCurrentLocation();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Bản đồ cửa hàng</Text>
          <Text style={styles.headerSubtitle}>Tìm cửa hàng gần bạn</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Map */}
      {useWebView ? (
        <WebView
          key={mapKey}
          ref={webViewRef}
          source={{ html: generateMapHTML() }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'store_click') {
                const store = STORES.find(s => s.id === data.storeId);
                if (store) {
                  handleStorePress(store);
                }
              }
            } catch (error) {
              console.error("Error parsing WebView message:", error);
            }
          }}
          onLoadEnd={() => {
            setLoading(false);
          }}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#D4AF37" />
              <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
            </View>
          )}
        />
      ) : !mapError ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          region={region}
          mapType={mapType}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          loadingEnabled={true}
          onMapReady={() => {
            console.log("Map is ready");
            setLoading(false);
          }}
        >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Vị trí của bạn"
            description="Bạn đang ở đây"
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}

        {/* Store Markers */}
        {STORES.map((store) => (
          <Marker
            key={store.id}
            coordinate={{
              latitude: store.latitude,
              longitude: store.longitude,
            }}
            title={store.name}
            description={store.address}
            onPress={() => handleStorePress(store)}
          >
            <View style={styles.storeMarker}>
              <LinearGradient
                colors={['#D4AF37', '#F4D03F']}
                style={styles.storeMarkerGradient}
              >
                <Ionicons name="storefront" size={20} color="#1a1a1a" />
              </LinearGradient>
            </View>
          </Marker>
        ))}
        </MapView>
      ) : (
        <View style={styles.mapErrorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF9800" />
          <Text style={styles.mapErrorText}>Không thể tải bản đồ</Text>
          <Text style={styles.mapErrorSubtext}>
            Vui lòng kiểm tra kết nối internet hoặc cài đặt ứng dụng
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setMapError(false);
              setLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Đang tải vị trí...</Text>
        </View>
      )}

      {/* Control Buttons */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={focusOnUserLocation}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#D4AF37', '#F4D03F']}
            style={styles.controlButtonGradient}
          >
            <Ionicons name="locate" size={24} color="#1a1a1a" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleMapType}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#1a1a1a', '#2d2d2d']}
            style={styles.controlButtonGradient}
          >
            <Ionicons
              name={mapType === "standard" ? "map" : "globe"}
              size={24}
              color="#D4AF37"
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Store List */}
      <View style={styles.storeList}>
        <Text style={styles.storeListTitle}>Danh sách cửa hàng</Text>
        {STORES.map((store) => (
          <TouchableOpacity
            key={store.id}
            style={[
              styles.storeCard,
              selectedStore?.id === store.id && styles.storeCardSelected,
            ]}
            onPress={() => handleStorePress(store)}
            activeOpacity={0.8}
          >
            <View style={styles.storeCardContent}>
              <LinearGradient
                colors={['#D4AF37', '#F4D03F']}
                style={styles.storeIcon}
              >
                <Ionicons name="storefront" size={20} color="#1a1a1a" />
              </LinearGradient>
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeAddress}>{store.address}</Text>
                {store.phone && (
                  <Text style={styles.storePhone}>{store.phone}</Text>
                )}
              </View>
            </View>
            <View style={styles.storeActions}>
              {store.phone && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleCallStore(store.phone!)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={18} color="#28a745" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleGetDirections(store)}
                activeOpacity={0.8}
              >
                <Ionicons name="navigate" size={18} color="#2196F3" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#ccc",
    marginTop: 2,
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  mapErrorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2d2d2d",
    padding: 20,
  },
  mapErrorText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
  },
  mapErrorSubtext: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#1a1a1a",
    fontSize: 16,
    fontWeight: "700",
  },
  loadingContainer: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  loadingText: {
    color: "#fff",
    marginTop: 8,
    fontSize: 14,
  },
  controls: {
    position: "absolute",
    right: 16,
    top: 120,
    gap: 12,
  },
  controlButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  controlButtonGradient: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2196F3",
    borderWidth: 3,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  userMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  storeMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  storeMarkerGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  storeList: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(26, 26, 26, 0.95)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: Dimensions.get("window").height * 0.4,
  },
  storeListTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  storeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  storeCardSelected: {
    borderColor: "#D4AF37",
    borderWidth: 2,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  storeCardContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  storeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 12,
    color: "#ccc",
    marginBottom: 2,
  },
  storePhone: {
    fontSize: 12,
    color: "#D4AF37",
    fontWeight: "600",
  },
  storeActions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MapScreen;
