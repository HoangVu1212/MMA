import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../context/UserContext";

interface Message {
  id: number;
  sender: "customer" | "owner";
  content: string;
  timestamp: string;
}

const STORAGE_KEY = "@chat_messages";

const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userData } = useUser();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    loadMessages();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  const loadMessages = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        const defaultMessages: Message[] = [
          {
            id: 1,
            sender: "owner",
            content: "Xin chào! 👋 Mình có thể giúp gì cho bạn ạ?",
            timestamp: new Date().toISOString(),
          },
          {
            id: 2,
            sender: "customer",
            content: "Mình cần tham khảo về sản phẩm nước hoa Lavender ạ",
            timestamp: new Date().toISOString(),
          },
        ];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMessages));
        setMessages(defaultMessages);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const saveMessages = async (messagesToSave: Message[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToSave));
    } catch (error) {
      console.error("Error saving messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const newMessageObj: Message = {
        id: Date.now(),
        sender: "customer",
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
      };
      const updatedMessages = [...messages, newMessageObj];
      setMessages(updatedMessages);
      setNewMessage("");
      await saveMessages(updatedMessages);

      setIsTyping(true);
      setTimeout(async () => {
        const adminResponse: Message = {
          id: Date.now() + 1,
          sender: "owner",
          content: generateAdminResponse(newMessage.trim()),
          timestamp: new Date().toISOString(),
        };
        const finalMessages = [...updatedMessages, adminResponse];
        setMessages(finalMessages);
        setIsTyping(false);
        await saveMessages(finalMessages);
      }, 1500);
    }
  };

  const generateAdminResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("lavender") || lowerMessage.includes("lavanda")) {
      return "Sản phẩm nước hoa Lavender của chúng tôi có hương thơm dịu nhẹ, thanh mát, phù hợp cho mọi lứa tuổi. Giá: 1.500.000₫. Bạn có muốn xem thêm chi tiết không?";
    } else if (lowerMessage.includes("giá") || lowerMessage.includes("price") || lowerMessage.includes("cost")) {
      return "Các sản phẩm nước hoa của chúng tôi có giá từ 800.000₫ đến 3.000.000₫ tùy theo loại. Bạn quan tâm đến sản phẩm nào cụ thể không?";
    } else if (lowerMessage.includes("địa chỉ") || lowerMessage.includes("address") || lowerMessage.includes("location")) {
      return "Cửa hàng của chúng tôi tại: 116 Trần Hưng Đạo, Phường Cẩm Phô, Hội An, Quảng Nam. Bạn có thể xem bản đồ trong ứng dụng nhé! 🗺️";
    } else if (lowerMessage.includes("cảm ơn") || lowerMessage.includes("thanks") || lowerMessage.includes("thank")) {
      return "Không có gì! Nếu bạn cần hỗ trợ thêm, cứ liên hệ mình nhé! 😊";
    } else if (lowerMessage.includes("chào") || lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Xin chào! Rất vui được hỗ trợ bạn. Bạn có thể hỏi về sản phẩm, giá cả, hoặc địa chỉ cửa hàng nhé!";
    } else {
      return "Cảm ơn bạn đã liên hệ! Mình sẽ hỗ trợ bạn tốt nhất có thể. Bạn có thể hỏi về sản phẩm, giá cả, hoặc địa chỉ cửa hàng nhé! 💬";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const getDefaultAvatar = (name: string) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=D4AF37&color=fff&size=200&bold=true`;
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isCustomer = item.sender === "customer";
    const showAvatar = index === 0 || messages[index - 1].sender !== item.sender;
    
    return (
      <Animated.View
        style={[
          styles.messageRow,
          isCustomer ? styles.customerRow : styles.ownerRow,
        ]}
      >
        {!isCustomer && showAvatar && (
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={['#28a745', '#20c997']}
              style={styles.avatarGradient}
            >
              <Ionicons name="headset" size={18} color="#fff" />
            </LinearGradient>
          </View>
        )}
        {!isCustomer && !showAvatar && <View style={styles.avatarSpacer} />}
        
        <View
          style={[
            styles.messageContainer,
            isCustomer ? styles.customerContainer : styles.ownerContainer,
          ]}
        >
          {isCustomer ? (
            <LinearGradient
              colors={['#D4AF37', '#F4D03F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.customerBubble}
            >
              <Text style={styles.customerText}>{item.content}</Text>
              <Text style={styles.customerTime}>{formatTime(item.timestamp)}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.ownerBubble}>
              <Text style={styles.ownerText}>{item.content}</Text>
              <Text style={styles.ownerTime}>{formatTime(item.timestamp)}</Text>
            </View>
          )}
        </View>

        {isCustomer && showAvatar && (
          <View style={styles.avatarWrapper}>
            {userData?.avatar ? (
              <Image
                source={{ uri: userData.avatar }}
                style={styles.userAvatar}
              />
            ) : (
              <Image
                source={{
                  uri: getDefaultAvatar(userData?.name || "User"),
                }}
                style={styles.userAvatar}
              />
            )}
          </View>
        )}
        {isCustomer && !showAvatar && <View style={styles.avatarSpacer} />}
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatarContainer}>
            <LinearGradient
              colors={['#28a745', '#20c997']}
              style={styles.headerAvatarGradient}
            >
              <Ionicons name="headset" size={22} color="#fff" />
            </LinearGradient>
            {!isTyping && (
              <View style={styles.onlineIndicator} />
            )}
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Hỗ trợ khách hàng</Text>
            <View style={styles.statusContainer}>
              {isTyping ? (
                <>
                  <View style={styles.typingDotSmall} />
                  <Text style={styles.headerStatus}>Đang nhập...</Text>
                </>
              ) : (
                <>
                  <View style={styles.onlineDot} />
                  <Text style={styles.headerStatus}>Trực tuyến</Text>
                </>
              )}
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
          <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Messages List */}
      <Animated.View 
        style={[
          styles.messagesContainer, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#666" />
              <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
            </View>
          }
        />
        
        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingWrapper}>
            <View style={styles.typingBubble}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, styles.typingDotDelay1]} />
              <View style={[styles.typingDot, styles.typingDotDelay2]} />
            </View>
          </View>
        )}
      </Animated.View>

      {/* Input Area */}
      <View style={styles.inputArea}>
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={24} color="#D4AF37" />
          </TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#999"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            {newMessage.length > 0 && (
              <View style={styles.charCount}>
                <Text style={styles.charCountText}>{newMessage.length}/500</Text>
              </View>
            )}
          </View>
          
          {newMessage.trim().length > 0 ? (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#D4AF37', '#F4D03F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendButtonGradient}
              >
                <Ionicons name="send" size={20} color="#1a1a1a" />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.micButton} activeOpacity={0.7}>
              <Ionicons name="mic-outline" size={24} color="#D4AF37" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
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
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 12,
  },
  headerAvatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  headerAvatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#1a1a1a",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  typingDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D4AF37",
  },
  headerStatus: {
    fontSize: 12,
    color: "#ccc",
    fontWeight: "500",
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  customerRow: {
    justifyContent: "flex-end",
  },
  ownerRow: {
    justifyContent: "flex-start",
  },
  avatarWrapper: {
    width: 36,
    height: 36,
    marginHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#D4AF37",
  },
  avatarSpacer: {
    width: 36,
    marginHorizontal: 8,
  },
  messageContainer: {
    maxWidth: "70%",
  },
  customerContainer: {
    alignItems: "flex-end",
  },
  ownerContainer: {
    alignItems: "flex-start",
  },
  customerBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    elevation: 4,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  ownerBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  customerText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#1a1a1a",
    fontWeight: "500",
    marginBottom: 4,
  },
  ownerText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#fff",
    marginBottom: 4,
  },
  customerTime: {
    fontSize: 11,
    color: "rgba(26, 26, 26, 0.6)",
    fontWeight: "500",
    alignSelf: "flex-end",
  },
  ownerTime: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    alignSelf: "flex-start",
  },
  typingWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  typingBubble: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  typingDotDelay1: {
    opacity: 0.7,
  },
  typingDotDelay2: {
    opacity: 0.4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  inputArea: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: Platform.OS === "ios" ? 24 : 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    minHeight: 44,
    maxHeight: 100,
    justifyContent: "center",
    position: "relative",
  },
  input: {
    fontSize: 15,
    color: "#fff",
    padding: 0,
    flex: 1,
    paddingRight: 50,
  },
  charCount: {
    position: "absolute",
    right: 12,
    bottom: 8,
  },
  charCountText: {
    fontSize: 11,
    color: "#999",
    fontWeight: "500",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  sendButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
});

export { ChatScreen };
