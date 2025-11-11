import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import Config from "./config";

interface ForgotPasswordProps {
  navigation: any;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [step, setStep] = useState(1);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const handleForgotPassword = async () => {
    let valid = true;
    setEmailError("");
    setPhoneError("");
    setPasswordError("");
  
    if (!email) {
      setEmailError("Email là bắt buộc");
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Định dạng email không hợp lệ");
      valid = false;
    }
  
    if (!phone) {
      setPhoneError("Số điện thoại là bắt buộc");
      valid = false;
    } else if (!validatePhone(phone)) {
      setPhoneError("Số điện thoại phải có 10 chữ số");
      valid = false;
    }
  
    if (!otp) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP");
      valid = false;
    }
  
    if (!newPassword) {
      setPasswordError("Mật khẩu mới là bắt buộc");
      valid = false;
    } else if (newPassword.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      valid = false;
    }
  
    if (!valid) return;
  
    setLoading(true);
    try {
      const response = await fetch(
        `${Config.API_BASE_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, phone, otp, newPassword }),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Thông tin không chính xác");
      }
  
      const data = await response.json();
      Alert.alert("Thành công", data.message, [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Đã xảy ra lỗi khi đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };
  
  const handleRequestOTP = async () => {
    try {
      const response = await fetch(`${Config.API_BASE_URL}/api/auth/sendOTP`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, phone }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể gửi mã OTP");
      }
  
      Alert.alert("Thành công", "Mã OTP đã được gửi!", [{ text: "OK" }]);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Đã xảy ra lỗi khi gửi OTP");
    }
  };
  
  const [otp, setOtp] = useState<string>("");

  const handleVerifyOTP = async () => {
    try {
      const response = await fetch(`${Config.API_BASE_URL}/api/auth/verifyOTP`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, phone, otp }),
      });
  
      const responseData = await response.json();
  
      console.log("Response data:", responseData);
  
      if (!response.ok) {
        throw new Error(responseData.message || "OTP không hợp lệ");
      }
  
      Alert.alert("Thành công", "OTP hợp lệ. Nhập mật khẩu mới!", [
        { text: "OK", onPress: () => setStep(2) },
      ]);
    } catch (error) {
      console.error("OTP verification error:", error);
      Alert.alert("Lỗi", "OTP không chính xác");
    }
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
            <View style={styles.logoContainer}>
              <Ionicons name="key" size={48} color="#D4AF37" />
            </View>
            <Text style={styles.welcomeText}>Quên mật khẩu</Text>
            <Text style={styles.subtitleText}>
              {step === 1 ? "Xác thực tài khoản để khôi phục" : "Nhập mật khẩu mới"}
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {step === 1 ? (
              <>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      focusedField === "email" && styles.inputContainerFocused,
                      emailError && styles.inputContainerError,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={22}
                      color={focusedField === "email" ? "#D4AF37" : "#888"}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập email của bạn"
                      placeholderTextColor="#999"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        setEmailError("");
                      }}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                </View>

                {/* Phone Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Số điện thoại</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      focusedField === "phone" && styles.inputContainerFocused,
                      phoneError && styles.inputContainerError,
                    ]}
                  >
                    <Ionicons
                      name="call-outline"
                      size={22}
                      color={focusedField === "phone" ? "#D4AF37" : "#888"}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập số điện thoại"
                      placeholderTextColor="#999"
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={(text) => {
                        setPhone(text);
                        setPhoneError("");
                      }}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      maxLength={10}
                    />
                  </View>
                  {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
                </View>

                {/* OTP Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mã OTP</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      focusedField === "otp" && styles.inputContainerFocused,
                    ]}
                  >
                    <Ionicons
                      name="key-outline"
                      size={22}
                      color={focusedField === "otp" ? "#D4AF37" : "#888"}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập mã OTP"
                      placeholderTextColor="#999"
                      keyboardType="number-pad"
                      value={otp}
                      onChangeText={setOtp}
                      onFocus={() => setFocusedField("otp")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                {/* Send OTP Button */}
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleRequestOTP}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#28a745', '#20c997']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Ionicons name="send" size={18} color="#fff" />
                    <Text style={styles.secondaryButtonText}>Gửi mã OTP</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Verify OTP Button */}
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleVerifyOTP}
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
                      <Text style={styles.primaryButtonText}>Đang xác thực...</Text>
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>Xác nhận OTP</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* New Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mật khẩu mới</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      focusedField === "password" && styles.inputContainerFocused,
                      passwordError && styles.inputContainerError,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={22}
                      color={focusedField === "password" ? "#D4AF37" : "#888"}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      placeholderTextColor="#999"
                      secureTextEntry={!showPassword}
                      value={newPassword}
                      onChangeText={(text) => {
                        setNewPassword(text);
                        setPasswordError("");
                      }}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={22}
                        color="#888"
                      />
                    </TouchableOpacity>
                  </View>
                  {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                </View>

                {/* Reset Password Button */}
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleForgotPassword}
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
                      <Text style={styles.primaryButtonText}>Đang xử lý...</Text>
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>Đặt lại mật khẩu</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* Back to Login Link */}
            <View style={styles.loginSection}>
              <Text style={styles.loginText}>Nhớ mật khẩu? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Đăng nhập ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
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
    marginBottom: 32,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    zIndex: 10,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
    borderWidth: 2,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
  },
  formSection: {
    flex: 1,
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
  inputContainerError: {
    borderColor: "#FF4444",
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
  eyeButton: {
    padding: 4,
  },
  errorText: {
    color: "#FF4444",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  secondaryButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#28a745",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "#ccc",
    fontSize: 14,
  },
  loginLink: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default ForgotPassword;
