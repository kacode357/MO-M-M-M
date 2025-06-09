import logo from '@/assets/images/logo-merchant.png';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Fallback version if EXPO_PUBLIC_APP_VERSION is not defined
const APP_VERSION = process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0';

const WelcomePage = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 30,
      backgroundColor: Colors[colorScheme].background,
    },
    textContainer: {
      alignItems: 'center', // Center text for professional look
      width: '100%',
      marginTop: 20,
    },
    title: {
      fontFamily: Fonts.Baloo2.ExtraBold,
      fontSize: 40, // Smaller for cleaner look
      lineHeight: 48,
      color: Colors[colorScheme].primaryText,
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 18, // Smaller for readability
      lineHeight: 24,
      color: Colors[colorScheme].primaryText,
      textAlign: 'center',
      marginBottom: 20,
    },
    highlightedText: {
      fontFamily: Fonts.Comfortaa.Bold,
      color: Colors[colorScheme].tabIconSelected,
    },
    logo: {
      width: 200, // Slightly smaller for balance
      height: 200,
      resizeMode: 'contain',
      marginVertical: 20,
    },
    loginButton: {
      width: 280, // Wider for prominence
      height: 48,
      borderWidth: 2,
      borderColor: Colors[colorScheme].primaryText,
      borderRadius: 24,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    buttonText: {
      fontFamily: Fonts.Comfortaa.Medium,
      fontSize: 16,
      color: Colors[colorScheme].primaryText,
    },
    createAccountButton: {
      width: 280,
      height: 48,
      backgroundColor: Colors[colorScheme].tabIconSelected, // Use selected color for emphasis
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    createAccountText: {
      fontFamily: Fonts.Comfortaa.Medium,
      fontSize: 16,
      color: Colors[colorScheme].background,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      width: 280,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: Colors[colorScheme].icon,
    },
    dividerText: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 14,
      color: Colors[colorScheme].icon,
      marginHorizontal: 10,
    },
    continueWithoutLogin: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 14,
      color: Colors[colorScheme].primaryText,
      textAlign: 'center',
    },
    versionContainer: {
      position: 'absolute',
      bottom: 20,
      right: 20,
    },
    versionText: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 12,
      color: Colors[colorScheme].icon,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Quản Lý Dễ Dàng!</Text>
        <Text style={styles.subtitle}>
          Đưa quán ăn của bạn lên{' '}
          <Text style={[styles.subtitle, styles.highlightedText]}>MAP</Text> và thu hút khách hàng!
        </Text>
      </View>
      <Image source={logo} style={styles.logo} />
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push('/(auth)/signin-merchant')}
      >
        <Text style={styles.buttonText}>Quản lý quán ngay</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.createAccountButton}
        onPress={() => router.push('/(auth)/signup')}
      >
        <Text style={styles.createAccountText}>Đăng ký người dùng</Text>
      </TouchableOpacity>
     
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Phiên bản: {APP_VERSION}</Text>
      </View>
    </View>
  );
};

export default WelcomePage;