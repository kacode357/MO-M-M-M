import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GetCurrentUserApi } from '@/services/user.services';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import DEFAULT_AVATAR from '@/assets/images/logo-app.png';

interface UserInfo {
  fullName: string;
  email: string;
  photo?: string;
  packageStatus: string;
}

const UserProfile = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const [userFullName, userDataResponse] = await Promise.all([
        AsyncStorage.getItem('user_fullname'),
        GetCurrentUserApi(),
      ]);

      let packageStatus = 'Miễn phí';
      const storedPackageNamesString = await AsyncStorage.getItem('packageNames');
      if (storedPackageNamesString) {
        const storedPackageNames: string[] = JSON.parse(storedPackageNamesString);
        if (storedPackageNames.length > 0) {
          packageStatus = storedPackageNames.join(', ');
        }
      }

      setUserInfo({
        fullName: userFullName ?? userDataResponse.data.fullName ?? 'Unknown User',
        email: userDataResponse.data.email,
        photo: userDataResponse.data.image,
        packageStatus,
      });
    } catch (error) {
      console.error('Error fetching user info:', error);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
    }, [fetchUserInfo])
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primaryText} />
        <Text style={[styles.loadingText, { fontFamily: Fonts.Comfortaa.Regular }]}>
          Đang tải thông tin...
        </Text>
      </View>
    );
  }

  if (!userInfo) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { fontFamily: Fonts.Comfortaa.Regular }]}>
          Không thể tải dữ liệu người dùng
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserInfo}>
          <Text style={[styles.retryButtonText, { fontFamily: Fonts.Comfortaa.Medium }]}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Image
              source={userInfo.photo ? { uri: userInfo.photo } : DEFAULT_AVATAR}
              style={styles.avatarImage}
              resizeMode="cover"
              defaultSource={DEFAULT_AVATAR}
            />
          </View>
          <View style={styles.nameAndLabel}>
            <Text
              style={styles.fullName}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {userInfo.fullName}
            </Text>
            <Text style={styles.packageLabel}>{userInfo.packageStatus}</Text>
          </View>
        </View>
        <View style={styles.settingsIconContainer}>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={24} color={Colors[colorScheme].whiteText} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Email</Text>
        <Text style={styles.infoValue}>{userInfo.email}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: Colors.light.tabBackground,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.icon,
    marginRight: 10,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  nameAndLabel: {
    flexShrink: 1,
    justifyContent: 'center',
    maxWidth: '70%',
  },
  fullName: {
    fontFamily: Fonts.Comfortaa.SemiBold,
    fontSize: 18,
    color: Colors.light.whiteText,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  packageLabel: {
    marginTop: 4,
    backgroundColor: '#FFE4B5',
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 10,
    fontFamily: Fonts.Comfortaa.ExtraBold,
    fontSize: 12,
    color: Colors.light.text,
    alignSelf: 'flex-start',
  },
  settingsIconContainer: {
    width: 40,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontFamily: Fonts.Comfortaa.Medium,
    fontSize: 16,
    color: Colors.light.text,
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.icon,
  },
  infoLabel: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 14,
    color: Colors.light.text,
  },
  infoValue: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 14,
    color: Colors.light.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.light.blackText,
  },
  retryButton: {
    backgroundColor: Colors.light.primaryText,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 15,
  },
  retryButtonText: {
    fontSize: 16,
    color: Colors.light.whiteText,
    textAlign: 'center',
  },
});

export default UserProfile;