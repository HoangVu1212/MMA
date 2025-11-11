import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Easing,
} from "react-native";
import axios from "../api/axiosConfig";

export default function TodoScreen({ navigation }) {
  const [task, setTask] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editTask, setEditTask] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🟢 Animate khi mở
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  // 🟢 Lấy user
  useEffect(() => {
    const fetchUser = async () => {
      const id = await AsyncStorage.getItem("userId");
      const name = await AsyncStorage.getItem("username");
      if (id) {
        setUserId(id);
        setUsername(name || "");
        fetchTasks(id);
      } else {
        Alert.alert("Lỗi", "Vui lòng đăng nhập lại!");
        navigation.replace("Login");
      }
    };
    fetchUser();
  }, []);

  // 🟢 Fetch task
  const fetchTasks = async (uid) => {
    try {
      const res = await axios.get(`/tasks/${uid}`);
      setTasks(res.data);
    } catch (err) {
      console.log("❌ Lỗi fetch:", err.message);
    }
  };

  // 🟢 Thêm task
  const addTask = async () => {
    if (!task.trim()) return Alert.alert("⚠️", "Vui lòng nhập công việc!");
    try {
      await axios.post("/tasks", { title: task, userId, difficulty });
      setTask("");
      setDifficulty("Easy");
      fetchTasks(userId);
    } catch (err) {
      console.log("❌ Lỗi thêm:", err.message);
    }
  };

  // 🟢 Toggle hoàn thành
  const toggleComplete = async (id) => {
    await axios.put(`/tasks/${id}`);
    fetchTasks(userId);
  };

  // 🟢 Xóa
  const deleteTask = async (id) => {
    await axios.delete(`/tasks/${id}`);
    fetchTasks(userId);
  };

  // 🟢 Sửa task
  const handleEditTask = async () => {
    if (!editTask.title.trim()) return Alert.alert("Lỗi", "Không được để trống!");
    try {
      await axios.put(`/tasks/${editTask._id}/edit`, {
        title: editTask.title,
        difficulty: editTask.difficulty,
      });
      setEditModal(false);
      fetchTasks(userId);
    } catch (err) {
      console.log("❌ Lỗi sửa:", err.message);
    }
  };

  // 🔴 Đăng xuất
  const logout = async () => {
    await AsyncStorage.multiRemove(["userId", "username"]);
    navigation.replace("Login");
  };

  return (
    <LinearGradient
      colors={["#6366F1", "#3B82F6", "#06B6D4"]}
      style={{ flex: 1, paddingTop: 50 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View>
            <Text style={styles.title}>Xin chào 👋</Text>
            <Text style={styles.username}>{username || "Người dùng"}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>🚪</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Nhập task */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Hôm nay bạn muốn làm gì?"
            placeholderTextColor="#94A3B8"
            value={task}
            onChangeText={setTask}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addTask}>
            <LinearGradient
              colors={["#2563EB", "#1E3A8A"]}
              style={styles.addGradient}
            >
              <Text style={styles.addText}>＋</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Chọn độ khó */}
        <View style={styles.diffContainer}>
          {["Easy", "Medium", "Hard"].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.diffBtn,
                difficulty === level && styles[`diff${level}`],
              ]}
              onPress={() => setDifficulty(level)}
            >
              <Text
                style={[
                  styles.diffText,
                  difficulty === level && styles.diffTextActive,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Danh sách Task */}
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Animated.View style={styles.taskCard}>
              <View
                style={[
                  styles.taskItem,
                  item.completed && styles.taskDone,
                  styles[`border${item.difficulty}`],
                ]}
              >
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => toggleComplete(item._id)}
                >
                  <Text
                    style={[
                      styles.taskText,
                      item.completed && styles.taskTextDone,
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.diffLabel}>🎯 {item.difficulty}</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity onPress={() => setEditModal(item)}>
                    <Text style={{ fontSize: 18 }}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert("Xóa task?", "Bạn có chắc muốn xóa?", [
                        { text: "Hủy" },
                        { text: "Xóa", onPress: () => deleteTask(item._id) },
                      ])
                    }
                  >
                    <Text style={{ fontSize: 18, color: "red" }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}
        />

        {/* Modal Edit */}
        <Modal visible={!!editModal} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>📝 Chỉnh sửa công việc</Text>
              <TextInput
                style={styles.modalInput}
                value={editTask?.title}
                onChangeText={(t) =>
                  setEditTask((prev) => ({ ...prev, title: t }))
                }
              />

              <View style={styles.diffContainer}>
                {["Easy", "Medium", "Hard"].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.diffBtn,
                      editTask?.difficulty === level && styles[`diff${level}`],
                    ]}
                    onPress={() =>
                      setEditTask((prev) => ({ ...prev, difficulty: level }))
                    }
                  >
                    <Text
                      style={[
                        styles.diffText,
                        editTask?.difficulty === level &&
                          styles.diffTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#2563EB" }]}
                  onPress={handleEditTask}
                >
                  <Text style={styles.modalBtnText}>💾 Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#EF4444" }]}
                  onPress={() => setEditModal(false)}
                >
                  <Text style={styles.modalBtnText}>✖ Hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// 🌈 STYLE MỚI
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    padding: 15,
    borderRadius: 16,
    marginBottom: 25,
    backdropFilter: "blur(10px)",
  },
  title: { fontSize: 22, fontWeight: "700", color: "#F8FAFC" },
  username: { fontSize: 16, color: "#E2E8F0" },
  logoutBtn: {
    backgroundColor: "#EF4444",
    padding: 8,
    borderRadius: 12,
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 15,
  },
  input: { flex: 1, fontSize: 16, color: "#1E293B", paddingVertical: 10 },
  addBtn: { marginLeft: 10, borderRadius: 30, overflow: "hidden" },
  addGradient: {
    width: 44,
    height: 44,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  addText: { color: "#fff", fontSize: 28, fontWeight: "600" },

  diffContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 15,
  },
  diffBtn: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: "#F8FAFC",
  },
  diffEasy: { backgroundColor: "#BBF7D0" },
  diffMedium: { backgroundColor: "#FDE68A" },
  diffHard: { backgroundColor: "#FCA5A5" },
  diffText: { fontSize: 14, color: "#334155" },
  diffTextActive: { fontWeight: "700", color: "#111827" },

  taskCard: { marginBottom: 12 },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  taskDone: { backgroundColor: "#DCFCE7" },
  taskText: { fontSize: 16, color: "#1E293B", fontWeight: "500" },
  taskTextDone: {
    textDecorationLine: "line-through",
    color: "#65A30D",
  },
  diffLabel: { fontSize: 13, color: "#64748B", marginTop: 4 },
  borderEasy: { borderLeftWidth: 5, borderLeftColor: "#22C55E" },
  borderMedium: { borderLeftWidth: 5, borderLeftColor: "#FACC15" },
  borderHard: { borderLeftWidth: 5, borderLeftColor: "#EF4444" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    color: "#1E3A8A",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
  },
  modalActions: { flexDirection: "row", justifyContent: "space-around" },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  modalBtnText: { color: "#fff", fontWeight: "700" },
});
