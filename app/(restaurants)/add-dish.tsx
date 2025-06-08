import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { createDish, getDishesBySnackPlace } from '@/services/dish.services';
import { pickAndUploadImage } from '@/utils/pickAndUploadImage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface Dish {
  dishId: string; // Sửa từ id thành dishId
  name: string;
  description: string;
  image: string;
  price: number;
  snackPlaceId: string;
  drink?: boolean; // Thêm field drink từ response
}

const AddDish = () => {
  const { id } = useLocalSearchParams() as { id: string };
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    price: '',
  });
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoadingDishes, setIsLoadingDishes] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePickImage = async () => {
    const result = await pickAndUploadImage(setIsUploading);
    if (result.imageUrl) {
      handleInputChange('image', result.imageUrl);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Tên món ăn không được để trống!');
      return false;
    }
    if (!formData.image) {
      Alert.alert('Lỗi', 'Phải chọn ảnh cho món ăn!');
      return false;
    }
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Lỗi', 'Giá món ăn phải là số lớn hơn 0!');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image,
        price: parseFloat(formData.price),
        snackPlaceId: id,
      };
      const response = await createDish(data);
      if (response.status === 200 || response.message?.includes('success')) {
        fetchDishes();
        setFormData({ name: '', description: '', image: '', price: '' });
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không tạo được món ăn!');
    } finally {
      setLoading(false);
    }
  };

  const fetchDishes = async () => {
    setIsLoadingDishes(true);
    try {
      const response = await getDishesBySnackPlace(id);
      console.log('Fetched dishes:', response.data);
      setDishes(response.data);
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không tải được danh sách món ăn!');
    } finally {
      setIsLoadingDishes(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDishes();
    }, [])
  );

  const renderDishItem = ({ item }: { item: Dish }) => (
    <View style={styles.dishItem}>
      {item.image && <Image source={{ uri: item.image }} style={styles.dishImage} />}
      <View style={styles.dishInfo}>
        <ThemedText style={styles.dishName}>{item.name}</ThemedText>
        {item.description && <ThemedText style={styles.dishDescription}>{item.description}</ThemedText>}
        <View style={styles.dishPriceContainer}>
          <ThemedText style={styles.dishPrice}>{item.price.toLocaleString('vi-VN')} VND</ThemedText>
          <TouchableOpacity
            onPress={() => {
              console.log('Navigating to EditDish with dishId:', item.dishId, 'snackPlaceId:', id);
              router.push({ pathname: '/editDish', params: { dishId: item.dishId, snackPlaceId: id } });
            }}
            style={styles.editButton}
          >
            <Ionicons name="pencil-outline" size={20} color={Colors.light.primaryText} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={loading || isUploading}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Thêm món ăn</ThemedText>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.formContainer}>
        <View style={styles.imagePickerContainer}>
          <TouchableOpacity
            style={[styles.imagePickerButton, (loading || isUploading) && styles.disabledButton]}
            onPress={handlePickImage}
            disabled={loading || isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color={Colors.light.primaryText} />
            ) : (
              <>
                <Ionicons name="camera-outline" size={24} color={Colors.light.primaryText} style={styles.icon} />
                <ThemedText style={styles.imagePickerText}>Chọn ảnh</ThemedText>
              </>
            )}
          </TouchableOpacity>
          {formData.image && <Image source={{ uri: formData.image }} style={styles.imagePreview} />}
        </View>
        <ThemedText style={styles.label}>Tên món ăn</ThemedText>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => handleInputChange('name', text)}
          placeholder="Nhập tên món ăn"
          placeholderTextColor={Colors.light.icon}
          editable={!loading && !isUploading}
        />
        <ThemedText style={styles.label}>Mô tả</ThemedText>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          value={formData.description}
          onChangeText={(text) => handleInputChange('description', text)}
          placeholder="Nhập mô tả món ăn (tuỳ chọn)"
          placeholderTextColor={Colors.light.icon}
          multiline
          numberOfLines={3}
          editable={!loading && !isUploading}
        />
        <ThemedText style={styles.label}>Giá món ăn (VND)</ThemedText>
        <TextInput
          style={styles.input}
          value={formData.price}
          onChangeText={(text) => handleInputChange('price', text)}
          placeholder="Nhập giá món ăn"
          placeholderTextColor={Colors.light.icon}
          keyboardType="numeric"
          editable={!loading && !isUploading}
        />
        <TouchableOpacity
          style={[styles.submitButton, (loading || isUploading) && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading || isUploading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.light.whiteText} />
          ) : (
            <ThemedText style={styles.submitButtonText}>Thêm Món</ThemedText>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.dishesContainer}>
        <ThemedText style={styles.dishesTitle}>Danh sách món ăn</ThemedText>
        {isLoadingDishes ? (
          <ActivityIndicator size="large" color={Colors.light.primaryText} />
        ) : dishes.length === 0 ? (
          <ThemedText style={styles.noDishesText}>Chưa có món ăn nào</ThemedText>
        ) : (
          <FlatList
            data={dishes}
            renderItem={renderDishItem}
            keyExtractor={(item) => item.dishId} // Sửa từ item.id thành item.dishId
            style={styles.dishesList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontFamily: Fonts.Baloo2.Bold,
    fontSize: 20,
    color: Colors.light.text,
  },
  formContainer: {
    marginBottom: 16,
  },
  imagePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  imagePickerButton: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.light.primaryText,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 4,
  },
  imagePickerText: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 13,
    color: Colors.light.primaryText,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.light.icon,
  },
  label: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.icon,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 12,
  },
  descriptionInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.light.primaryText,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 14,
    color: Colors.light.whiteText,
  },
  dishesContainer: {
    flex: 1,
  },
  dishesTitle: {
    fontFamily: Fonts.Baloo2.Bold,
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 12,
  },
  dishesList: {
    flex: 1,
  },
  dishItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light.icon,
  },
  dishImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 12,
  },
  dishInfo: {
    flex: 1,
  },
  dishName: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 14,
    color: Colors.light.text,
  },
  dishDescription: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 12,
    color: Colors.light.icon,
    marginVertical: 4,
  },
  dishPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dishPrice: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 12,
    color: Colors.light.primaryText,
  },
  editButton: {
    padding: 4,
  },
  noDishesText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 14,
    color: Colors.light.icon,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default AddDish;