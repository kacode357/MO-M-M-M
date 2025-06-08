import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { getDishesBySnackPlace, updateDish } from '@/services/dish.services';
import { pickAndUploadImage } from '@/utils/pickAndUploadImage';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface Dish {
  dishId: string; // Sửa từ id thành dishId
  name: string;
  description: string;
  image: string;
  price: number;
  snackPlaceId: string;
  drink?: boolean;
}

const EditDish = () => {
  const { dishId, snackPlaceId } = useLocalSearchParams() as { dishId?: string; snackPlaceId?: string };
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    price: '',
  });
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Validate params
  useEffect(() => {
    if (!dishId || !snackPlaceId) {
      Alert.alert('Lỗi', 'Thiếu thông tin món ăn hoặc quán!');
      router.back();
    }
  }, [dishId, snackPlaceId]);

  // Load dữ liệu món ăn
  useEffect(() => {
    if (!dishId || !snackPlaceId) return;
    const fetchDish = async () => {
      try {
        const response = await getDishesBySnackPlace(snackPlaceId);
        console.log('Fetched dishes in EditDish:', response.data);
        const dish = response.data.find((d: Dish) => d.dishId === dishId);
        if (dish) {
          setFormData({
            name: dish.name,
            description: dish.description,
            image: dish.image,
            price: dish.price.toString(),
          });
        } else {
          Alert.alert('Lỗi', 'Không tìm thấy món ăn!');
          router.back();
        }
      } catch (error: any) {
        Alert.alert('Lỗi', 'Không tải được dữ liệu món ăn!');
        router.back();
      }
    };
    fetchDish();
  }, [dishId, snackPlaceId]);

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
    if (!dishId || !snackPlaceId) {
      Alert.alert('Lỗi', 'Thiếu thông tin món ăn hoặc quán!');
      return;
    }
    if (!validateForm()) return;
    setLoading(true);
    try {
      const data = {
        dishId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image,
        price: parseFloat(formData.price),
        snackPlaceId,
      };
      console.log('Sending updateDish payload:', data);
      const response = await updateDish(data);
      if (response.status === 200 || response.message?.includes('success')) {
        router.back();
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không cập nhật được món ăn!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={loading || isUploading}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Chỉnh sửa món ăn</ThemedText>
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
            <ThemedText style={styles.submitButtonText}>Cập nhật</ThemedText>
          )}
        </TouchableOpacity>
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
});

export default EditDish;