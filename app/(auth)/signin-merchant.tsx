import logo from '@/assets/images/logo-merchant.png';
import AlertModal from '@/components/AlertModal';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LoginUserApi } from '@/services/merchants.services';
import { GetCurrentUserApi } from '@/services/user.services';
import { signinStyles } from '@/styles/SigninMerchantStyles';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const SigninMerChant = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    isSuccess?: boolean;
    onConfirm?: () => void;
  }>({ title: '', message: '' });

  const togglePasswordVisibility = () => setSecureTextEntry(!secureTextEntry);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleSignin = async () => {
    console.log('Signin button pressed');
    if (!userName || !password) {
      setModalConfig({
        title: 'Lỗi',
        message: 'Vui lòng điền đầy đủ tên đăng nhập và mật khẩu',
      });
      setModalVisible(true);
      return;
    }

    console.log('Attempting to sign in with:', { userName, password });
    setIsLoading(true);
    try {
      const loginResponse = await LoginUserApi({ userName, password });
      const { accessToken, refreshToken } = loginResponse.data;
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      const userResponse = await GetCurrentUserApi();
      const {  id, userName: userNameResponse, email, fullname, roles } = userResponse.data;
      const packageNames = userResponse.data.userPackages.map(
                        (item: { packageName: string }) => item.packageName
                    );
                    const jsonValue = JSON.stringify(packageNames);
                    await AsyncStorage.setItem("packageNames", jsonValue);
      
      // Check first role in roles array
      if (roles[0] !== 'Merchant') {
        setModalConfig({
          title: 'Lỗi Quyền Truy Cập',
          message: 'Chỉ chủ quán mới có thể sử dụng tính năng này.',
        });
        setModalVisible(true);
        return;
      }

   
      await AsyncStorage.setItem('user_id', id);
      await AsyncStorage.setItem('user_name', userNameResponse);
      await AsyncStorage.setItem('user_email', email);
      await AsyncStorage.setItem('user_fullname', fullname);
      await AsyncStorage.setItem('user_role', roles[0]);
      router.push('/(tabs)');
    } catch (error) {
      console.error('Signin error:', error);
      setModalConfig({
        title: 'Lỗi',
        message: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
      });
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = signinStyles(colorScheme, isLoading);

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} />
        </View>
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Trở thành đối tác cùng chúng mình</Text>
          <View style={styles.dividerLine} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>ĐĂNG NHẬP</Text>
        </View>

        <Text style={styles.inputLabel}>Tên đăng nhập</Text>
        <TextInput
          style={styles.input}
          placeholder="username"
          placeholderTextColor={Colors[colorScheme].icon}
          value={userName}
          onChangeText={setUserName}
          autoCapitalize="none"
          editable={!isLoading}
        />

        <Text style={styles.inputLabel}>Mật khẩu</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••"
            placeholderTextColor={Colors[colorScheme].icon}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureTextEntry}
            autoCapitalize="none"
            editable={!isLoading}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
            <Ionicons
              name={secureTextEntry ? 'eye-off' : 'eye'}
              size={20}
              color={Colors[colorScheme].primaryText}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.forgotPasswordContainer}>
          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => {
            Keyboard.dismiss();
            handleSignin();
          }}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Text>
        </TouchableOpacity>

        <View style={styles.signupLinkContainer}>
          <Text style={styles.signupText}>Bạn chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.signupLink}>Đăng ký tại đây</Text>
          </TouchableOpacity>
        </View>

        <AlertModal
          visible={modalVisible}
          title={modalConfig.title}
          message={modalConfig.message}
          isSuccess={modalConfig.isSuccess}
          onConfirm={() => {
            setModalVisible(false);
            if (modalConfig.onConfirm) modalConfig.onConfirm();
          }}
          onCancel={() => setModalVisible(false)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SigninMerChant;