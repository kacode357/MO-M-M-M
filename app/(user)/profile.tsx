import DEFAULT_AVATAR from '@/assets/images/logo-app.png';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GetCurrentUserApi } from '@/services/user.services';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator // Import ActivityIndicator for loading state
  ,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface UserInfo {
  fullName: string;
  email: string;
  photo?: string;
  packageStatus: string; // Add packageStatus to UserInfo interface
}

const UserProfile = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const user_fullname = await AsyncStorage.getItem('user_fullname');
      const { data } = await GetCurrentUserApi();

      let currentPackageStatus = 'Miễn phí'; // Default status

      // Try to retrieve packageNames from AsyncStorage
      const storedPackageNamesString = await AsyncStorage.getItem('packageNames');
      if (storedPackageNamesString) {
        const storedPackageNames: string[] = JSON.parse(storedPackageNamesString);

        if (storedPackageNames.length > 0) {
          // If there are packages, display them
          currentPackageStatus = storedPackageNames.join(', '); // Join package names with a comma
        }
      }

      setUserInfo({
        fullName: user_fullname ?? data.fullName ?? 'Unknown User',
        email: data.email,
        photo: data.image,
        packageStatus: currentPackageStatus, // Set the determined package status
      });
    } catch (error) {
      console.error('Error fetching user info:', error);
      // If GetCurrentUserApi fails or AsyncStorage fails, we might still want to show a fallback
      // or redirect based on the severity of the error.
      // For now, let's just log and set null userInfo, allowing the 'Failed to load' message.
      setUserInfo(null); // Set userInfo to null to trigger the "Failed to load user data" message
      // Consider redirecting to sign-in only for authentication-related errors
      // router.replace('/(auth)/signin-merchant');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
    }, [fetchUserInfo])
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primaryText} />
        <Text style={[styles.loadingText, { fontFamily: Fonts.Comfortaa.Regular }]}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (!userInfo) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { fontFamily: Fonts.Comfortaa.Regular }]}>Không thể tải dữ liệu người dùng</Text>
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
            {/* Display the determined package status */}
            <Text style={styles.freeLabel}>{userInfo.packageStatus}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={24} color={Colors[colorScheme].whiteText} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Email</Text>
        <Text style={styles.infoValue}>{userInfo.email}</Text>
      </View>
    </ScrollView>
  );
};

export default UserProfile;

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
    backgroundColor: Colors.light.tabBackground,
    paddingTop: 50,
    padding: 20,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    flex: 1,
    flexShrink: 1,
    justifyContent: 'center',
  },
  fullName: {
    fontFamily: Fonts.Comfortaa.SemiBold,
    fontSize: 18,
    color: Colors.light.whiteText,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  freeLabel: {
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
    backgroundColor: Colors.light.background, // Ensure background color for consistency
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.light.blackText, // Use a suitable color from your Colors
  },
  retryButton: {
    backgroundColor: Colors.light.primaryText, // Use a suitable color from your Colors
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