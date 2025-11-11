import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import axios from "../api/axiosConfig";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      if (isRegister) {
        const res = await axios.post("/auth/register", { username, password });
        if (res.status === 201) {
          Alert.alert("🎉 Thành công", "Đăng ký thành công! Hãy đăng nhập.");
          setIsRegister(false);
        }
      } else {
        const res = await axios.post("/auth/login", { username, password });

        if (res.data && res.data._id) {
          await AsyncStorage.setItem("userId", res.data._id);
          await AsyncStorage.setItem("username", username);
          Alert.alert("✅ Thành công", "Đăng nhập thành công!");
          navigation.replace("Todo");
        } else {
          Alert.alert("Lỗi", "Sai thông tin đăng nhập!");
        }
      }
    } catch (err) {
      console.log("❌ Error:", err.message);
      Alert.alert(
        "Lỗi",
        err.response?.data?.message || "Không thể kết nối đến server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={["#6EE7B7", "#3B82F6"]}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <Text style={styles.logo}>📝 Todo App</Text>
          <Text style={styles.subtitle}>
            {isRegister ? "Tạo tài khoản mới" : "Đăng nhập để bắt đầu"}
          </Text>

          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Tên đăng nhập"
              placeholderTextColor="#aaa"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.7 },
            ]}
            onPress={handleAuth}
          >
            <LinearGradient
              colors={["#2563EB", "#1D4ED8"]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {loading
                  ? "⏳ Đang xử lý..."
                  : isRegister
                  ? "Đăng ký"
                  : "Đăng nhập"}
              </Text>
            </LinearGradient>
          </Pressable>

          <TouchableOpacity
            onPress={() => setIsRegister(!isRegister)}
            style={{ marginTop: 20 }}
          >
            <Text style={styles.toggleText}>
              {isRegister
                ? "🔙 Đã có tài khoản? Đăng nhập"
                : "🧾 Chưa có tài khoản? Đăng ký ngay"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>© 2025 Todo App | OneDev Studio</Text>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    alignItems: "center",
  },
  logo: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#1E40AF",
    marginBottom: 10,
  },
  subtitle: {
    color: "#6B7280",
    marginBottom: 25,
    fontSize: 15,
  },
  inputBox: { width: "100%", gap: 12 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  button: {
    width: "100%",
    marginTop: 20,
    borderRadius: 14,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  toggleText: {
    fontSize: 15,
    color: "#1E40AF",
    fontWeight: "500",
  },
  footer: {
    position: "absolute",
    bottom: 25,
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
});
