import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Promotions = () => {
  // Function to handle navigation for each package
  const handleLearnMore = (packageType: 'basic' | 'standard') => {
    if (packageType === 'basic') {
      router.push('/(promotion)/basic-package');
    } else if (packageType === 'standard') {
      router.push('/(promotion)/standard-package');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quảng bá thương hiệu</Text>
        <Text style={styles.headerSubtitle}>
          Quảng bá thương hiệu của bạn hiệu quả hơn thông qua các gói dịch vụ của chúng tôi
        </Text>
      </View>

      {/* Package 1: Gói Cơ Bản */}
      <View style={styles.packageCard}>
        <View style={styles.packageInfo}>
          <Text style={styles.packageTitle}>Gói Cơ Bản</Text>
          <Text style={styles.packageDescription}>
            Hỗ trợ các quán tạo thương hiệu với logo, menu, bài công nghệ AI
          </Text>
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => handleLearnMore('basic')}
          >
            <Text style={styles.learnMoreText}>Tìm hiểu thêm</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={{
            uri: 'https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D',
          }}
          style={styles.packageImage}
        />
      </View>

      {/* Package 2: Gói Tiêu Chuẩn */}
      <View style={styles.packageCard}>
        <View style={styles.packageInfo}>
          <Text style={styles.packageTitle}>Gói Tiêu Chuẩn</Text>
          <Text style={styles.packageDescription}>
            Quảng bá thương hiệu bằng cách đề xuất hiển thị trên banner
          </Text>
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => handleLearnMore('standard')}
          >
            <Text style={styles.learnMoreText}>Tìm hiểu thêm</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={{
            uri: 'https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D',
          }}
          style={styles.packageImage}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: Fonts.Baloo2.Bold,
    fontSize: 32,
    color: Colors.light.blackText,
    textAlign: 'left',
  },
  headerSubtitle: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
    color: Colors.light.primaryText,
    textAlign: 'left',
  },
  packageCard: {
    padding: 2,
    flexDirection: 'row',
    backgroundColor: Colors.light.whiteText,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.primaryText,
    elevation: 2,
  },
  packageInfo: {
    flex: 2,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  packageTitle: {
    fontFamily: Fonts.Baloo2.Bold,
    fontSize: 24,
    color: Colors.light.blackText,
  },
  packageDescription: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 14,
    color: Colors.light.blackText,
    marginVertical: 10,
  },
  learnMoreButton: {
    backgroundColor: Colors.light.primaryText,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'center',
    marginTop: 10,
  },
  learnMoreText: {
    fontFamily: Fonts.Comfortaa.Medium,
    fontSize: 14,
    color: Colors.light.whiteText,
    textAlign: 'center',
  },
  packageImage: {
    width: 150,
    height: 200,
    borderRadius: 12,
  },
});

export default Promotions;