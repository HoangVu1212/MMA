// layout.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const productsData = [
  {
    id: "1",
    name: "Ultraboost 1.0 Shoes",
    desc: "Promo codes will not apply to this product",
    price: 118,
    image: "https://assets.adidas.com/images/w_600,f_auto,q_auto/9e6d23bb5a8743f78d9aad0f00a19a15_9366/Ultraboost_1.0_Shoes_White_GY9350_01_standard.jpg",
  },
  {
    id: "2",
    name: "ADIDAS Runesy",
    desc: "Buy ADIDAS Runesy M Running Shoes For Men Online",
    price: 200,
    image: "https://assets.adidas.com/images/w_600,f_auto,q_auto/4c72baf076c14300a8f9af6500b36f10_9366/Runesy_Shoes_Blue_GY6509_01_standard.jpg",
  },
  {
    id: "3",
    name: "Adidas | Ultraboost Light",
    desc: "Buy Ultraboost Light M Running Shoes For Men Online",
    price: 250,
    image: "https://assets.adidas.com/images/w_600,f_auto,q_auto/91eb3a1f9b6a41b2b5f8ad1f00a6c1a2_9366/Ultraboost_Light_Shoes_Black_GX5462_01_standard.jpg",
  },
];


export default function Layout() {
  const [products, setProducts] = useState(
    productsData.map((item) => ({ ...item, qty: 1, selected: false }))
  );

  const toggleSelect = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const updateQty = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, qty: Math.max(1, p.qty + delta) } : p
      )
    );
  };

  const deleteSelected = () => {
    setProducts((prev) => prev.filter((p) => !p.selected));
  };

  const total = products
    .filter((p) => p.selected)
    .reduce((sum, p) => sum + p.price * p.qty, 0);

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.desc}>{item.desc}</Text>
        <Text style={styles.price}>{item.price} $</Text>
      </View>
      <TouchableOpacity onPress={() => toggleSelect(item.id)}>
        <Ionicons
          name={item.selected ? "checkbox" : "square-outline"}
          size={24}
          color="#007AFF"
        />
      </TouchableOpacity>
      <View style={styles.qtyBox}>
        <TouchableOpacity onPress={() => updateQty(item.id, -1)}>
          <Ionicons name="remove-circle-outline" size={22} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.qty}>{item.qty}</Text>
        <TouchableOpacity onPress={() => updateQty(item.id, 1)}>
          <Ionicons name="add-circle-outline" size={22} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Cart</Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={deleteSelected}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Total {total} $</Text>
        <TouchableOpacity style={styles.checkoutBtn}>
          <Text style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "bold" },
  deleteBtn: { backgroundColor: "#007AFF", paddingHorizontal: 15, paddingVertical: 6, borderRadius: 8 },
  deleteText: { color: "#fff", fontWeight: "bold" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#f9f9f9", borderRadius: 10, padding: 10, marginBottom: 10 },
  image: { width: 70, height: 70, marginRight: 10, borderRadius: 10 },
  name: { fontSize: 14, fontWeight: "bold" },
  desc: { fontSize: 12, color: "gray" },
  price: { fontSize: 14, color: "red", fontWeight: "bold" },
  qtyBox: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
  qty: { marginHorizontal: 5, fontSize: 14 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10, borderTopWidth: 1, borderColor: "#eee" },
  total: { fontSize: 18, fontWeight: "bold", color: "red" },
  checkoutBtn: { backgroundColor: "#007AFF", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
  checkoutText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
