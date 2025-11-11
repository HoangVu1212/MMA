import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from '../services/api';

interface RegisterProps {
  navigation: any;
}

const Register: React.FC<RegisterProps> = ({ navigation }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [dobError, setDobError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Tạo avatar mặc định dựa trên tên
  const getDefaultAvatar = (userName: string) => {
    const initials = userName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=D4AF37&color=fff&size=200&bold=true`;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validateDob = (dob: string) => {
    const dobRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    return dobRegex.test(dob);
  };

  const handleRegister = async () => {
    let valid = true;
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setDobError('');
    setAddressError('');
    setPasswordError('');

    if (!name) {
      setNameError('Họ và tên là bắt buộc');
      valid = false;
    }

    if (!email) {
      setEmailError('Email là bắt buộc');
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Định dạng email không hợp lệ');
      valid = false;
    }

    if (!phone) {
      setPhoneError('Số điện thoại là bắt buộc');
      valid = false;
    } else if (!validatePhone(phone)) {
      setPhoneError('Số điện thoại phải có 10 chữ số');
      valid = false;
    }

    if (!dob) {
      setDobError('Ngày sinh là bắt buộc');
      valid = false;
    } else if (!validateDob(dob)) {
      setDobError('Định dạng ngày sinh phải là DD/MM/YYYY');
      valid = false;
    }

    if (!password) {
      setPasswordError('Mật khẩu là bắt buộc');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      valid = false;
    }

    if (!address) {
      setAddressError('Địa chỉ là bắt buộc');
      valid = false;
    }

    if (!valid) return;

    setLoading(true);
    // Tạo avatar mặc định từ tên người dùng
    const defaultAvatar = getDefaultAvatar(name);
    const userData = { name, email, phone, dob, address, password, avatar: defaultAvatar };

    try {
      await apiService.register(userData);
      Alert.alert('Thành công', 'Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
      navigation.replace('Login', { email });
    } catch (error: any) {
      console.error('Lỗi khi đăng ký:', error);
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi khi đăng ký');
    } finally {
      setLoading(false);
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
              <Ionicons name="flower" size={48} color="#D4AF37" />
            </View>
            <Text style={styles.welcomeText}>Tạo tài khoản</Text>
            <Text style={styles.subtitleText}>Đăng ký để bắt đầu mua sắm</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === "name" && styles.inputContainerFocused,
                  nameError && styles.inputContainerError,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={22}
                  color={focusedField === "name" ? "#D4AF37" : "#888"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setNameError('');
                  }}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="words"
                />
              </View>
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>

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
                    setEmailError('');
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
                    setPhoneError('');
                  }}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  maxLength={10}
                />
              </View>
              {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
            </View>

            {/* Date of Birth Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày sinh</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === "dob" && styles.inputContainerFocused,
                  dobError && styles.inputContainerError,
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color={focusedField === "dob" ? "#D4AF37" : "#888"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#999"
                  value={dob}
                  onChangeText={(text) => {
                    setDob(text);
                    setDobError('');
                  }}
                  onFocus={() => setFocusedField("dob")}
                  onBlur={() => setFocusedField(null)}
                  maxLength={10}
                />
              </View>
              {dobError ? <Text style={styles.errorText}>{dobError}</Text> : null}
            </View>

            {/* Address Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Địa chỉ</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === "address" && styles.inputContainerFocused,
                  addressError && styles.inputContainerError,
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={22}
                  color={focusedField === "address" ? "#D4AF37" : "#888"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập địa chỉ của bạn"
                  placeholderTextColor="#999"
                  value={address}
                  onChangeText={(text) => {
                    setAddress(text);
                    setAddressError('');
                  }}
                  onFocus={() => setFocusedField("address")}
                  onBlur={() => setFocusedField(null)}
                  multiline
                  numberOfLines={2}
                />
              </View>
              {addressError ? <Text style={styles.errorText}>{addressError}</Text> : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
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
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError('');
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

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              style={styles.registerButton}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={loading ? ['#888', '#777'] : ['#D4AF37', '#C9A227', '#B8941F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.registerButtonGradient}
              >
                {loading ? (
                  <Text style={styles.registerButtonText}>Đang đăng ký...</Text>
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>Đăng ký</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginSection}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
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
  registerButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  registerButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
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

export default Register;
