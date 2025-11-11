import React, { useEffect, useState, useRef } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import apiService from '../services/api';
import { useUser } from '../context/UserContext';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userData: globalUserData, refreshUserData, setUserData: setGlobalUserData } = useUser();
  const [localUserData, setLocalUserData] = useState(globalUserData || {
    name: "",
    email: "",
    phone: "",
    dob: "",
    avatar: "",
    address: "",
    _id: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const dobInputRef = useRef<TextInput>(null);
  const addressInputRef = useRef<TextInput>(null);

  // Sync local data with global data
  useEffect(() => {
    if (globalUserData && !isEditing) {
      // Only update if not editing to avoid overwriting user input
      setLocalUserData(globalUserData);
    }
  }, [globalUserData, isEditing]);

  const handleStartEdit = () => {
    // Save current global data as backup when starting to edit
    if (globalUserData) {
      setLocalUserData({ ...globalUserData });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset to original data
    if (globalUserData) {
      setLocalUserData(globalUserData);
    }
    setIsEditing(false);
    setFocusedField(null);
  };

  const handleSave = async () => {
    if (!isEditing) return;
    
    setLoading(true);
    try {
      const userId = localUserData._id;
      if (!userId) {
        throw new Error("Không tìm thấy ID người dùng");
      }

      const responseData: any = await apiService.updateProfile(userId, localUserData);
      
      if (responseData?.user) {
        await setGlobalUserData(responseData.user);
        setLocalUserData(responseData.user);
      }
      Alert.alert("Thành công", "Thông tin đã được cập nhật!");
      await refreshUserData();
      setIsEditing(false);
    } catch (error: any) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      Alert.alert("Lỗi", error.message || "Đã xảy ra lỗi khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền', 'Cần quyền truy cập thư viện ảnh để đổi avatar');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const updatedUserData = { ...localUserData, avatar: result.assets[0].uri };
      setLocalUserData(updatedUserData);
      
      // Auto save avatar when changed
      if (localUserData._id) {
        try {
          const responseData: any = await apiService.updateProfile(localUserData._id, updatedUserData);
          if (responseData?.user) {
            await setGlobalUserData(responseData.user);
            setLocalUserData(responseData.user);
          }
          Alert.alert("Thành công", "Avatar đã được cập nhật!");
        } catch (error: any) {
          console.error("Lỗi khi cập nhật avatar:", error);
          Alert.alert("Lỗi", error.message || "Không thể cập nhật avatar");
        }
      }
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      const userId = localUserData._id;
      if (!userId) {
        Alert.alert("Lỗi", "Không tìm thấy ID người dùng!");
        return;
      }

      await apiService.changePassword(userId, currentPassword, newPassword);
      
      Alert.alert("Thành công", "Mật khẩu đã được cập nhật!");
      setIsPasswordModalVisible(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Mật khẩu hiện tại không đúng hoặc có lỗi xảy ra.");
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.welcomeText}>Hồ sơ cá nhân</Text>
            <Text style={styles.subtitleText}>Quản lý thông tin của bạn</Text>
          </View>

          {/* Avatar Section with Quick Actions */}
          <View style={styles.avatarSection}>
            <TouchableOpacity 
              onPress={pickImage} 
              style={styles.avatarContainer} 
              activeOpacity={0.8}
            >
              <View style={styles.avatarBorder}>
                <Image
                  source={{
                    uri: localUserData.avatar || getDefaultAvatar(localUserData.name || "User")
                  }}
                  style={styles.avatar}
                />
              </View>
              <LinearGradient
                colors={['#D4AF37', '#F4D03F']}
                style={styles.avatarEditBadge}
              >
                <Ionicons name="camera" size={18} color="#1a1a1a" />
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{localUserData.name || "Người dùng"}</Text>
              <Text style={styles.userEmail}>{localUserData.email}</Text>
            </View>
            
            {/* Quick Action Buttons */}
            {!isEditing && (
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={handleStartEdit}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#D4AF37', '#F4D03F']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="create-outline" size={20} color="#1a1a1a" />
                    <Text style={styles.quickActionText}>Chỉnh sửa</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => setIsPasswordModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#28a745', '#20c997']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="lock-closed" size={20} color="#fff" />
                    <Text style={[styles.quickActionText, { color: '#fff' }]}>Đổi mật khẩu</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Information Card */}
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <LinearGradient
                    colors={['#D4AF37', '#F4D03F']}
                    style={styles.cardIconContainer}
                  >
                    <Ionicons name="person-circle" size={24} color="#1a1a1a" />
                  </LinearGradient>
                  <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
                </View>
              </View>

              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Họ và tên</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === "name" && styles.inputContainerFocused,
                    !isEditing && styles.inputContainerDisabled,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={22}
                    color={focusedField === "name" ? "#D4AF37" : "#888"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={nameInputRef}
                    style={[styles.input, !isEditing && styles.inputDisabled]}
                    placeholder="Nhập họ và tên"
                    placeholderTextColor="#999"
                    value={localUserData.name || ""}
                    onChangeText={(text) => setLocalUserData({ ...localUserData, name: text })}
                    editable={isEditing}
                    selectTextOnFocus={false}
                    onFocus={() => {
                      if (isEditing) {
                        setFocusedField("name");
                      }
                    }}
                    onBlur={() => {
                      setFocusedField(null);
                    }}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    keyboardType="default"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputContainer, styles.inputContainerDisabled]}>
                  <Ionicons
                    name="mail-outline"
                    size={22}
                    color="#888"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value={localUserData.email || ""}
                    editable={false}
                  />
                  <Ionicons name="lock-closed" size={18} color="#888" />
                </View>
                <View style={styles.hintContainer}>
                  <Ionicons name="information-circle-outline" size={12} color="#ccc" />
                  <Text style={styles.hintText}>Email không thể thay đổi</Text>
                </View>
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Số điện thoại</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === "phone" && styles.inputContainerFocused,
                    !isEditing && styles.inputContainerDisabled,
                  ]}
                >
                  <Ionicons
                    name="call-outline"
                    size={22}
                    color={focusedField === "phone" ? "#D4AF37" : "#888"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={phoneInputRef}
                    style={[styles.input, !isEditing && styles.inputDisabled]}
                    placeholder="Nhập số điện thoại"
                    placeholderTextColor="#999"
                    value={localUserData.phone || ""}
                    onChangeText={(text) => setLocalUserData({ ...localUserData, phone: text })}
                    keyboardType="phone-pad"
                    editable={isEditing}
                    selectTextOnFocus={false}
                    onFocus={() => {
                      if (isEditing) {
                        setFocusedField("phone");
                      }
                    }}
                    onBlur={() => setFocusedField(null)}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              {/* Date of Birth */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ngày sinh</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === "dob" && styles.inputContainerFocused,
                    !isEditing && styles.inputContainerDisabled,
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={22}
                    color={focusedField === "dob" ? "#D4AF37" : "#888"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={dobInputRef}
                    style={[styles.input, !isEditing && styles.inputDisabled]}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#999"
                    value={localUserData.dob || ""}
                    onChangeText={(text) => setLocalUserData({ ...localUserData, dob: text })}
                    editable={isEditing}
                    selectTextOnFocus={false}
                    onFocus={() => {
                      if (isEditing) {
                        setFocusedField("dob");
                      }
                    }}
                    onBlur={() => setFocusedField(null)}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
              </View>
            </View>

            {/* Address Card */}
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <LinearGradient
                    colors={['#28a745', '#20c997']}
                    style={styles.cardIconContainer}
                  >
                    <Ionicons name="location" size={24} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.cardTitle}>Địa chỉ</Text>
                </View>
                {localUserData.address && !isEditing && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.verifiedText}>Đã có</Text>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Địa chỉ</Text>
                <View
                  style={[
                    styles.inputContainer,
                    styles.addressContainer,
                    focusedField === "address" && styles.inputContainerFocused,
                    !isEditing && styles.inputContainerDisabled,
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={22}
                    color={focusedField === "address" ? "#D4AF37" : "#888"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={addressInputRef}
                    style={[styles.input, styles.textArea, !isEditing && styles.inputDisabled]}
                    placeholder="Nhập địa chỉ của bạn"
                    placeholderTextColor="#999"
                    value={localUserData.address || ""}
                    onChangeText={(text) => setLocalUserData({ ...localUserData, address: text })}
                    editable={isEditing}
                    selectTextOnFocus={false}
                    multiline
                    numberOfLines={3}
                    onFocus={() => {
                      if (isEditing) {
                        setFocusedField("address");
                      }
                    }}
                    onBlur={() => setFocusedField(null)}
                    returnKeyType="done"
                    blurOnSubmit={true}
                  />
                </View>
                {!localUserData.address && !isEditing && (
                  <View style={styles.warningContainer}>
                    <Ionicons name="alert-circle" size={14} color="#FF9800" />
                    <Text style={styles.warningText}>
                      Chưa có địa chỉ. Nhấn "Chỉnh sửa" để cập nhật
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            {isEditing && (
              <View style={styles.editingButtons}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={loading ? ['#888', '#777'] : ['#D4AF37', '#C9A227', '#B8941F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <Text style={styles.buttonText}>Đang lưu...</Text>
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Lưu thay đổi</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.9}
                >
                  <Ionicons name="close-circle-outline" size={20} color="#ccc" />
                  <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Password Change Modal */}
      <Modal
        visible={isPasswordModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsPasswordModalVisible(false);
                  setCurrentPassword("");
                  setNewPassword("");
                }}
              >
                <Ionicons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Current Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.modalLabel}>Mật khẩu hiện tại</Text>
                <View
                  style={[
                    styles.modalInputContainer,
                    focusedField === "currentPassword" && styles.modalInputContainerFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color={focusedField === "currentPassword" ? "#D4AF37" : "#888"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Nhập mật khẩu hiện tại"
                    placeholderTextColor="#999"
                    secureTextEntry={!showCurrentPassword}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    onFocus={() => setFocusedField("currentPassword")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showCurrentPassword ? "eye-off" : "eye"}
                      size={20}
                      color={focusedField === "currentPassword" ? "#D4AF37" : "#888"}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.modalLabel}>Mật khẩu mới</Text>
                <View
                  style={[
                    styles.modalInputContainer,
                    focusedField === "newPassword" && styles.modalInputContainerFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color={focusedField === "newPassword" ? "#D4AF37" : "#888"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    placeholderTextColor="#999"
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    onFocus={() => setFocusedField("newPassword")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showNewPassword ? "eye-off" : "eye"}
                      size={20}
                      color={focusedField === "newPassword" ? "#D4AF37" : "#888"}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.hintContainer}>
                  <Ionicons name="information-circle-outline" size={12} color="#999" />
                  <Text style={styles.modalHintText}>Mật khẩu phải có ít nhất 6 ký tự</Text>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setIsPasswordModalVisible(false);
                    setCurrentPassword("");
                    setNewPassword("");
                  }}
                >
                  <Text style={styles.modalCancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleChangePassword}
                >
                  <LinearGradient
                    colors={['#4CAF50', '#45a049']}
                    style={styles.modalButtonGradient}
                  >
                    <Text style={styles.modalSaveButtonText}>Lưu</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 24,
    position: 'relative',
    paddingTop: 8,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 8,
    padding: 8,
    zIndex: 10,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 13,
    color: "#ccc",
    textAlign: "center",
  },
  // Avatar Section
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 20,
  },
  avatarContainer: {
    marginBottom: 16,
    position: "relative",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 20,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  quickActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: 0.3,
  },
  avatarBorder: {
    padding: 6,
    borderRadius: 75,
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderWidth: 3,
    borderColor: "rgba(212, 175, 55, 0.5)",
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#2d2d2d",
    elevation: 6,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 14,
    color: "#ccc",
    letterSpacing: 0.3,
  },
  // Form Section
  formSection: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputContainerFocused: {
    borderColor: "#D4AF37",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  inputContainerDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    opacity: 0.6,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    padding: 0,
  },
  inputDisabled: {
    color: "#999",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 8,
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  hintText: {
    fontSize: 12,
    color: "#ccc",
    fontStyle: "italic",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "rgba(255, 152, 0, 0.15)",
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  warningText: {
    fontSize: 12,
    color: "#FF9800",
    flex: 1,
    fontWeight: "500",
  },
  addressContainer: {
    minHeight: 80,
    alignItems: "flex-start",
  },
  // Button Section
  editingButtons: {
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  saveButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cancelButtonText: {
    color: "#ccc",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal Styles
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  modalInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: "#e8e8e8",
  },
  modalInputContainerFocused: {
    borderColor: "#D4AF37",
    backgroundColor: "#fffef5",
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a1a",
    padding: 0,
  },
  modalHintText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: "85%",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
  modalBody: {
    paddingBottom: 24,
  },
  eyeButton: {
    padding: 6,
    marginLeft: 4,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 14,
    marginTop: 28,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  modalCancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  modalSaveButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  modalButtonGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;
