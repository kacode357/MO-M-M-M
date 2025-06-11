import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CheckCreatedSnackplaceApi } from '@/services/merchants.services';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define the Restaurant interface for TypeScript
interface Restaurant {
  id: string;
  name: string;
  rating: string;
  address: string;
  mainDish: string;
  averagePrice: number;
  openingHour: string;
  businessModelName: string;
  tastes: string[];
  diets: string[];
  foodTypes: string[];
  image: string;
}

// Helper function to format price as VND
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

// Helper function to format time
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'Tối' : 'Sáng';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${period}`;
};

// Restaurants Component
const Restaurants = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch restaurant data when component mounts
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await CheckCreatedSnackplaceApi();
       

        if (response?.status === 200) {
          if (response.data && typeof response.data === 'object') {
            // Map API response to Restaurant interface
            setRestaurant({
              id: response.data.snackPlaceId || '',
              name: response.data.placeName || 'Unknown',
              rating: response.data.rating || 'N/A',
              address: response.data.address || 'Chưa có địa chỉ',
              mainDish: response.data.mainDish?.trim() || 'Chưa có món chính',
              averagePrice: response.data.averagePrice || 0,
              openingHour: response.data.openingHour || '00:00:00',
              businessModelName: response.data.businessModelName || 'Chưa xác định',
              tastes: response.data.attributes?.tastes?.map((taste: { tasteName: string }) => taste.tasteName) || [],
              diets: response.data.attributes?.diets?.map((diet: { dietName: string }) => diet.dietName) || [],
              foodTypes: response.data.attributes?.foodTypes?.map((foodType: { foodTypeName: string }) => foodType.foodTypeName) || [],
              image: response.data.image || '',
            });
          } else {
            setRestaurant(null);
          }
        } else {
          setError('Không thể kiểm tra trạng thái quán ăn.');
        }
      } catch (err) {
        setError('Đã xảy ra lỗi khi tải dữ liệu quán ăn.');
        console.error('Error fetching restaurants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleCreateRestaurant = () => {
    router.push('/(restaurants)/create');
  };

  const handleEditRestaurant = () => {
    if (restaurant?.id) {
      router.push({
        pathname: '/(restaurants)/edit',
        params: { id: restaurant.id },
      });
    }
  };

  const handleAddDish = () => {
    if (restaurant?.id) {
      router.push({
        pathname: '/(restaurants)/add-dish',
        params: { id: restaurant.id },
      });
    }
  };

  const renderRestaurantDetails = () => {
    if (!restaurant) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có quán ăn nào</Text>
        </View>
      );
    }

    return (
      <View style={styles.restaurantContainer}>
        {restaurant.image ? (
          <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
        ) : (
          <View style={[styles.restaurantImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>Không có ảnh</Text>
          </View>
        )}
        <View style={styles.detailsContainer}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantDetails}>
            <Text style={styles.boldLabel}>Đánh giá:</Text> {restaurant.rating} ★
          </Text>
          <Text style={styles.restaurantDetails}>
            <Text style={styles.boldLabel}>Địa chỉ:</Text> {restaurant.address}
          </Text>
          <Text style={styles.restaurantDetails}>
            <Text style={styles.boldLabel}>Món chính:</Text> {restaurant.mainDish}
          </Text>
          <Text style={styles.restaurantDetails}>
            <Text style={styles.boldLabel}>Giá trung bình:</Text> {formatPrice(restaurant.averagePrice)}
          </Text>
          <Text style={styles.restaurantDetails}>
            <Text style={styles.boldLabel}>Giờ mở cửa:</Text> {formatTime(restaurant.openingHour)}
          </Text>
          <Text style={styles.restaurantDetails}>
            <Text style={styles.boldLabel}>Loại hình:</Text> {restaurant.businessModelName}
          </Text>
          <Text style={styles.restaurantDetails}>
            <Text style={styles.boldLabel}>Hương vị:</Text>{' '}
            {restaurant.tastes.length > 0 ? restaurant.tastes.join(', ') : 'Chưa có thông tin'}
          </Text>
          <Text style={styles.restaurantDetails}>
            <Text style={styles.boldLabel}>Chế độ ăn:</Text>{' '}
            {restaurant.diets.length > 0 ? restaurant.diets.join(', ') : 'Chưa có thông tin'}
          </Text>
          <Text style={styles.restaurantDetails}>
            <Text style={styles.boldLabel}>Loại món:</Text>{' '}
            {restaurant.foodTypes.length > 0 ? restaurant.foodTypes.join(', ') : 'Chưa có thông tin'}
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={handleEditRestaurant}
            >
              <Text style={styles.buttonText}>Chỉnh sửa thông tin</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.addButton]}
              onPress={handleAddDish}
            >
              <Text style={styles.buttonText}>Thêm Món</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quán ăn của bạn</Text>
        {!loading && !error && !restaurant && (
          <TouchableOpacity style={styles.createButton} onPress={handleCreateRestaurant}>
            <Ionicons
              name="add"
              size={24}
              color={Colors[colorScheme].whiteText}
            />
          </TouchableOpacity>
        )}
      </View>
      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Đang tải dữ liệu...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : (
        renderRestaurantDetails()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.icon,
  },
  title: {
    fontFamily: Fonts.Baloo2.Bold,
    fontSize: 24,
    color: Colors.light.text,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primaryText,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantContainer: {
    flex: 1,
  },
  restaurantImage: {
    width: '100%',
    height: 180,
  },
  placeholderImage: {
    backgroundColor: Colors.light.icon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
    color: Colors.light.background,
  },
  detailsContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
    flex: 1,
  },
  restaurantName: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 22,
    color: Colors.light.text,
    marginBottom: 8,
  },
  restaurantDetails: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
    color: Colors.light.icon,
    marginTop: 6,
  },
  boldLabel: {
    fontFamily: Fonts.Comfortaa.Bold,
    color: Colors.light.blackText,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
    color: Colors.light.icon,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 30,
    marginTop: 20,
    marginBottom: 20,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2, // Add border
    borderColor: Colors.light.primaryText, // Border color
  },
  editButton: {
    paddingHorizontal: 20,
  },
  addButton: {
    paddingHorizontal: 15,
  },
  buttonText: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 16,
    color: Colors.light.primaryText, // Text color
  },
});

export default Restaurants;