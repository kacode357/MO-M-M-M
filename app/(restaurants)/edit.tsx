import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getSnackPlaceById, updateSnackPlace } from '@/services/snackplace.services';
import { styles } from '@/styles/CreateRestaurantStyles';
import { pickAndUploadImage } from '@/utils/pickAndUploadImage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface SnackPlaceData {
  snackPlaceId: string;
  placeName: string;
  ownerName: string;
  address: string;
  email: string;
  phoneNumber: string;
  description: string;
  coordinates: string;
  openingHour: string;
  averagePrice: number;
  image: string;
  mainDish: string;
  businessModelId: string;
  businessModelName: string;
  attributes: {
    tastes: { tasteId: string; tasteName: string }[];
    diets: { dietId: string; dietName: string }[];
    foodTypes: { foodTypeId: string; foodTypeName: string }[];
  };
}

const EditRestaurant = () => {
  const { id } = useLocalSearchParams() as { id: string };
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const params = useLocalSearchParams();

  // Form state
  const [placeName, setPlaceName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [openingTime, setOpeningTime] = useState<Date | null>(null);
  const [showOpeningPicker, setShowOpeningPicker] = useState(false);
  const [averagePrice, setAveragePrice] = useState('');
  const [mainDish, setMainDish] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessModel, setBusinessModel] = useState('');
  const [businessModelName, setBusinessModelName] = useState('');
  const [tasteIds, setTasteIds] = useState<string[]>([]);
  const [dietIds, setDietIds] = useState<string[]>([]);
  const [foodTypeIds, setFoodTypeIds] = useState<string[]>([]);
  const [tasteNames, setTasteNames] = useState<string[]>([]);
  const [dietNames, setDietNames] = useState<string[]>([]);
  const [foodTypeNames, setFoodTypeNames] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load snack place data
  useEffect(() => {
    const loadSnackPlace = async () => {
      try {
        setIsLoading(true);
        const response = await getSnackPlaceById(id);
        const data: SnackPlaceData = response.data;

        setPlaceName(data.placeName);
        setOwnerName(data.ownerName);
        setAddress(data.address);
        setEmail(data.email);
        setCoordinates(data.coordinates);
        setOpeningTime(parseTime(data.openingHour));
        setAveragePrice(data.averagePrice.toString());
        setMainDish(data.mainDish);
        setPhoneNumber(data.phoneNumber);
        setBusinessModel(data.businessModelId);
        setBusinessModelName(data.businessModelName);
        setTasteIds(data.attributes.tastes.map((t) => t.tasteId));
        setDietIds(data.attributes.diets.map((d) => d.dietId));
        setFoodTypeIds(data.attributes.foodTypes.map((f) => f.foodTypeId));
        setTasteNames(data.attributes.tastes.map((t) => t.tasteName));
        setDietNames(data.attributes.diets.map((d) => d.dietName));
        setFoodTypeNames(data.attributes.foodTypes.map((f) => f.foodTypeName));
        setDescription(data.description);
        setImageUrl(data.image || '');
      } catch (error: any) {
        Alert.alert('Lỗi', 'Không thể tải thông tin quán ăn.');
        console.error('Load Snack Place error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSnackPlace();
  }, [id]);

  // Memoize params to prevent unnecessary updates
  const memoizedParams = useMemo(() => ({
    placeName: params.placeName as string,
    ownerName: params.ownerName as string,
    address: params.address as string,
    email: params.email as string,
    coordinates: params.coordinates as string,
    openingTime: params.openingTime as string,
    averagePrice: params.averagePrice as string,
    mainDish: params.mainDish as string,
    phoneNumber: params.phoneNumber as string,
    businessModel: params.businessModel as string,
    businessModelName: params.businessModelName as string,
    description: params.description as string,
    imageUrl: params.imageUrl as string,
    tasteIds: params.tasteIds as string,
    dietIds: params.dietIds as string,
    foodTypeIds: params.foodTypeIds as string,
    tasteNames: params.tasteNames as string,
    dietNames: params.dietNames as string,
    foodTypeNames: params.foodTypeNames as string,
  }), [
    params.placeName,
    params.ownerName,
    params.address,
    params.email,
    params.coordinates,
    params.openingTime,
    params.averagePrice,
    params.mainDish,
    params.phoneNumber,
    params.businessModel,
    params.businessModelName,
    params.description,
    params.imageUrl,
    params.tasteIds,
    params.dietIds,
    params.foodTypeIds,
    params.tasteNames,
    params.dietNames,
    params.foodTypeNames,
  ]);

  // Update state from navigation params
  useEffect(() => {
    const updateStateFromParams = () => {
      // Only update if the new value is different
      if (memoizedParams.placeName && memoizedParams.placeName !== placeName) {
        setPlaceName(memoizedParams.placeName);
      }
      if (memoizedParams.ownerName && memoizedParams.ownerName !== ownerName) {
        setOwnerName(memoizedParams.ownerName);
      }
      if (memoizedParams.address && memoizedParams.address !== address) {
        setAddress(memoizedParams.address);
      }
      if (memoizedParams.email && memoizedParams.email !== email) {
        setEmail(memoizedParams.email);
      }
      if (memoizedParams.coordinates && memoizedParams.coordinates !== coordinates) {
        setCoordinates(memoizedParams.coordinates);
      }
      if (memoizedParams.openingTime && memoizedParams.openingTime !== formatTime(openingTime)) {
        const parsedTime = parseTime(memoizedParams.openingTime);
        if (parsedTime) setOpeningTime(parsedTime);
      }
      if (memoizedParams.averagePrice && memoizedParams.averagePrice !== averagePrice) {
        setAveragePrice(memoizedParams.averagePrice);
      }
      if (memoizedParams.mainDish && memoizedParams.mainDish !== mainDish) {
        setMainDish(memoizedParams.mainDish);
      }
      if (memoizedParams.phoneNumber && memoizedParams.phoneNumber !== phoneNumber) {
        setPhoneNumber(memoizedParams.phoneNumber);
      }
      if (memoizedParams.businessModel && memoizedParams.businessModel !== businessModel) {
        setBusinessModel(memoizedParams.businessModel);
      }
      if (memoizedParams.businessModelName && memoizedParams.businessModelName !== businessModelName) {
        setBusinessModelName(memoizedParams.businessModelName);
      }
      if (memoizedParams.description && memoizedParams.description !== description) {
        setDescription(memoizedParams.description);
      }
      if (memoizedParams.imageUrl && memoizedParams.imageUrl !== imageUrl) {
        setImageUrl(memoizedParams.imageUrl);
      }

      const parseArrayParam = (param: string | undefined, setter: (value: string[]) => void, current: string[]) => {
        if (param && typeof param === 'string') {
          try {
            const parsed = JSON.parse(param);
            if (JSON.stringify(parsed) !== JSON.stringify(current)) {
              setter(parsed);
            }
          } catch (error) {
            console.error(`Error parsing ${param}:`, error);
          }
        }
      };

      parseArrayParam(memoizedParams.tasteIds, setTasteIds, tasteIds);
      parseArrayParam(memoizedParams.dietIds, setDietIds, dietIds);
      parseArrayParam(memoizedParams.foodTypeIds, setFoodTypeIds, foodTypeIds);
      parseArrayParam(memoizedParams.tasteNames, setTasteNames, tasteNames);
      parseArrayParam(memoizedParams.dietNames, setDietNames, dietNames);
      parseArrayParam(memoizedParams.foodTypeNames, setFoodTypeNames, foodTypeNames);
    };

    updateStateFromParams();
  }, [memoizedParams, placeName, ownerName, address, email, coordinates, openingTime, averagePrice, mainDish, phoneNumber, businessModel, businessModelName, description, imageUrl, tasteIds, dietIds, foodTypeIds, tasteNames, dietNames, foodTypeNames]);

  // Format time to HH:mm:ss
  const formatTime = (date: Date | null): string => {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}:00`;
  };

  // Parse HH:mm:ss to Date
  const parseTime = (timeStr: string): Date | null => {
    if (!timeStr || !/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleImageSelect = async () => {
    const result = await pickAndUploadImage(setIsUploading);
    if (result.imageUrl) {
      setImageUrl(result.imageUrl);
    }
  };

  const handleTimeChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowOpeningPicker(false);
    }
    if (selectedDate) {
      setOpeningTime(selectedDate);
    }
  };

  const validateForm = () => {
    if (!placeName) return 'Vui lòng nhập tên quán ăn';
    if (!address) return 'Vui lòng nhập địa chỉ';
    if (!openingTime) return 'Vui lòng chọn giờ mở cửa';
    if (!averagePrice || isNaN(parseFloat(averagePrice))) return 'Vui lòng nhập giá trung bình hợp lệ';
    if (!mainDish) return 'Vui lòng nhập món ăn chính';
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) return 'Số điện thoại phải có 10 chữ số';
    if (!businessModel) return 'Vui lòng chọn mô hình kinh doanh';
    if (!imageUrl) return 'Vui lòng chọn ảnh';
    if (!description) return 'Vui lòng nhập mô tả';
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Lỗi', error);
      return;
    }

    try {
      const data = {
        snackPlaceId: id,
        placeName,
        ownerName: ownerName || '',
        address,
        email: email || '',
        coordinates,
        openingHour: formatTime(openingTime),
        averagePrice: parseFloat(averagePrice) || 0,
        image: imageUrl || '',
        mainDish,
        phoneNumber,
        businessModelId: businessModel,
        tasteIds,
        dietIds,
        foodTypeIds,
        description: description.trim(),
      };

      await updateSnackPlace(data);
      Alert.alert('Thành công', 'Cập nhật quán ăn thành công!');
      router.push('/(tabs)/restaurants');
    } catch (error: any) {
      Alert.alert('Lỗi', 'Cập nhật quán ăn thất bại.');
      console.error('Update Snack Place error:', error);
    }
  };

  const navigateToBusinessModel = () => {
    router.push({
      pathname: '/(restaurants)/business-model-update',
      params: {
        businessModel,
        businessModelName,
        tasteIds: JSON.stringify(tasteIds),
        dietIds: JSON.stringify(dietIds),
        foodTypeIds: JSON.stringify(foodTypeIds),
        tasteNames: JSON.stringify(tasteNames),
        dietNames: JSON.stringify(dietNames),
        foodTypeNames: JSON.stringify(foodTypeNames),
        imageUrl,
        placeName,
        ownerName,
        address,
        email,
        coordinates,
        openingTime: formatTime(openingTime),
        averagePrice,
        mainDish,
        phoneNumber,
        description,
        id,
      },
    });
  };

  const navigateToFlavor = () => {
    router.push({
      pathname: '/(restaurants)/flavor-update',
      params: {
        businessModel,
        businessModelName,
        tasteIds: JSON.stringify(tasteIds),
        dietIds: JSON.stringify(dietIds),
        foodTypeIds: JSON.stringify(foodTypeIds),
        tasteNames: JSON.stringify(tasteNames),
        dietNames: JSON.stringify(dietNames),
        foodTypeNames: JSON.stringify(foodTypeNames),
        imageUrl,
        placeName,
        ownerName,
        address,
        email,
        coordinates,
        openingTime: formatTime(openingTime),
        averagePrice,
        mainDish,
        phoneNumber,
        description,
        id,
      },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors[colorScheme].primaryText} />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/restaurants')}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
          </TouchableOpacity>
          <Text style={styles.title}>Chỉnh sửa quán ăn</Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.form}>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={handleImageSelect}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="large" color={Colors[colorScheme].primaryText} />
              ) : imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: '100%', height: '100%', borderRadius: 10 }}
                />
              ) : (
                <>
                  <Ionicons name="camera" size={40} color={Colors[colorScheme].icon} />
                  <Text style={styles.imagePickerText}>Chọn ảnh</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.inputLabel}>Tên quán ăn</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên quán ăn"
              placeholderTextColor={Colors[colorScheme].icon}
              value={placeName}
              onChangeText={setPlaceName}
              autoCapitalize="none"
            />
            <Text style={styles.inputLabel}>Địa chỉ</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập địa chỉ quán ăn"
              placeholderTextColor={Colors[colorScheme].icon}
              value={address}
              onChangeText={setAddress}
              autoCapitalize="none"
            />
            <Text style={styles.inputLabel}>Mô tả quán ăn</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Nhập mô tả quán ăn"
              placeholderTextColor={Colors[colorScheme].icon}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              autoCapitalize="sentences"
            />
            <Text style={styles.inputLabel}>Giờ mở cửa</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowOpeningPicker(true)}
            >
              <Text
                style={{
                  color: openingTime ? Colors[colorScheme].text : Colors[colorScheme].icon,
                  marginTop: 13,
                  fontSize: 17,
                }}
              >
                {openingTime ? formatTime(openingTime) : 'Chọn giờ mở cửa'}
              </Text>
            </TouchableOpacity>
            {showOpeningPicker && (
              <DateTimePicker
                value={openingTime || new Date()}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
                onChange={handleTimeChange}
              />
            )}
            <Text style={styles.inputLabel}>Giá trung bình</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 50000"
              placeholderTextColor={Colors[colorScheme].icon}
              value={averagePrice}
              onChangeText={setAveragePrice}
              keyboardType="numeric"
            />
            <Text style={styles.inputLabel}>Món ăn chính</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Phở, Bún bò"
              placeholderTextColor={Colors[colorScheme].icon}
              value={mainDish}
              onChangeText={setMainDish}
              autoCapitalize="none"
            />
            <Text style={styles.inputLabel}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 0901234567"
              placeholderTextColor={Colors[colorScheme].icon}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={navigateToBusinessModel}
            >
              <Text style={styles.selectionButtonText}>Chọn mô hình kinh doanh</Text>
            </TouchableOpacity>
            {businessModelName && (
              <Text style={styles.selectedText}>Mô hình: {businessModelName}</Text>
            )}
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={navigateToFlavor}
            >
              <Text style={styles.selectionButtonText}>Chọn khẩu vị món ăn</Text>
            </TouchableOpacity>
            {tasteNames.length > 0 && (
              <Text style={styles.selectedText}>Khẩu vị: {tasteNames.join(', ')}</Text>
            )}
            {dietNames.length > 0 && (
              <Text style={styles.selectedText}>Chế độ ăn: {dietNames.join(', ')}</Text>
            )}
            {foodTypeNames.length > 0 && (
              <Text style={styles.selectedText}>Loại món: {foodTypeNames.join(', ')}</Text>
            )}
            <TouchableOpacity
              style={[styles.submitButton, { opacity: isUploading ? 0.6 : 1 }]}
              onPress={handleSubmit}
              disabled={isUploading}
            >
              <Text style={styles.submitButtonText}>Cập nhật quán ăn</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default EditRestaurant;