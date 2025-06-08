import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createSnackPlace } from '@/services/snackplace.services';
import { styles } from '@/styles/CreateRestaurantStyles';
import { pickAndUploadImage } from '@/utils/pickAndUploadImage';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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

const CreateRestaurant = () => {
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
  const [description, setDescription] = useState(''); // New description state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Load user data from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [storedUserId, storedOwnerName, storedEmail] = await Promise.all([
          AsyncStorage.getItem('user_id'),
          AsyncStorage.getItem('user_name'),
          AsyncStorage.getItem('user_email'),
        ]);

        setUserId(storedUserId);
        setOwnerName(storedOwnerName || '');
        setEmail(storedEmail || '');
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng.');
      }
    };

    loadUserData();
  }, []);

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

  // Update state from navigation params
  const updateStateFromParams = useCallback(() => {
    const paramFields = [
      { key: 'businessModel', setter: setBusinessModel, current: businessModel },
      { key: 'businessModelName', setter: setBusinessModelName, current: businessModelName },
      { key: 'placeName', setter: setPlaceName, current: placeName },
      { key: 'ownerName', setter: setOwnerName, current: ownerName },
      { key: 'address', setter: setAddress, current: address },
      { key: 'email', setter: setEmail, current: email },
      { key: 'coordinates', setter: setCoordinates, current: coordinates },
      { key: 'averagePrice', setter: setAveragePrice, current: averagePrice },
      { key: 'mainDish', setter: setMainDish, current: mainDish },
      { key: 'phoneNumber', setter: setPhoneNumber, current: phoneNumber },
      { key: 'imageUrl', setter: setImageUrl, current: imageUrl },
      { key: 'description', setter: setDescription, current: description }, // Handle description param
    ];

    paramFields.forEach(({ key, setter, current }) => {
      if (params[key] && params[key] !== '' && params[key] !== 'undefined' && params[key] !== current) {
        setter(params[key] as string);
      }
    });

    // Handle openingTime
    if (params.openingTime && params.openingTime !== formatTime(openingTime)) {
      const parsedTime = parseTime(params.openingTime as string);
      if (parsedTime) {
        setOpeningTime(parsedTime);
      }
    }

    const parseArrayParam = (param: string | string[] | undefined, setter: (value: string[]) => void, current: string[]) => {
      if (param && typeof param === 'string' && param !== 'undefined' && param !== '') {
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

    parseArrayParam(params.tasteIds, setTasteIds, tasteIds);
    parseArrayParam(params.dietIds, setDietIds, dietIds);
    parseArrayParam(params.foodTypeIds, setFoodTypeIds, foodTypeIds);
    parseArrayParam(params.tasteNames, setTasteNames, tasteNames);
    parseArrayParam(params.dietNames, setDietNames, dietNames);
    parseArrayParam(params.foodTypeNames, setFoodTypeNames, foodTypeNames);
  }, [
    params,
    businessModel,
    businessModelName,
    placeName,
    ownerName,
    address,
    email,
    coordinates,
    averagePrice,
    mainDish,
    phoneNumber,
    imageUrl,
    openingTime,
    tasteIds,
    dietIds,
    foodTypeIds,
    tasteNames,
    dietNames,
    foodTypeNames,
    description, // Add description to dependencies
  ]);

  useEffect(() => {
    updateStateFromParams();
  }, [updateStateFromParams]);

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

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập lại.');
      return;
    }
    if (!placeName || !address || !openingTime || !averagePrice || !mainDish || !phoneNumber || !businessModel || !imageUrl || !description) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin, chọn ảnh và nhập mô tả.');
      return;
    }

    try {
      const data = {
        userId,
        placeName,
        ownerName: ownerName || '',
        address,
        email: email || '',
        coordinates,
        openingHour: formatTime(openingTime),
        averagePrice: parseFloat(averagePrice) || 0,
        image: imageUrl,
        mainDish,
        phoneNumber,
        businessModelId: businessModel,
        tasteIds,
        dietIds,
        foodTypeIds,
        description: description.trim(), // Include description
      };

      const response = await createSnackPlace(data);
    
      router.push('/(tabs)/restaurants');

      // Reset form
      setPlaceName('');
      setOwnerName('');
      setAddress('');
      setEmail('');
      setCoordinates('');
      setOpeningTime(null);
      setAveragePrice('');
      setMainDish('');
      setPhoneNumber('');
      setBusinessModel('');
      setBusinessModelName('');
      setTasteIds([]);
      setDietIds([]);
      setFoodTypeIds([]);
      setTasteNames([]);
      setDietNames([]);
      setFoodTypeNames([]);
      setDescription(''); // Reset description
      setImageUrl(null);
    } catch (error: any) {
      Alert.alert('Lỗi', 'Tạo quán ăn thất bại: ' + (error.message || 'Không xác định'));
      console.error('Create Snack Place error:', error);
    }
  };

  const navigateToBusinessModel = () => {
    router.push({
      pathname: '/(restaurants)/business-model',
      params: {
        businessModel,
        businessModelName,
        tasteIds: JSON.stringify(tasteIds),
        dietIds: JSON.stringify(dietIds),
        foodTypeIds: JSON.stringify(foodTypeIds),
        tasteNames: JSON.stringify(tasteNames),
        dietNames: JSON.stringify(dietNames),
        foodTypeNames: JSON.stringify(foodTypeNames),
        imageUrl: imageUrl || '',
        placeName,
        ownerName,
        address,
        email,
        coordinates,
        openingTime: formatTime(openingTime),
        averagePrice,
        mainDish,
        phoneNumber,
        description, // Pass description
      },
    });
  };

  const navigateToFlavor = () => {
    router.push({
      pathname: '/(restaurants)/flavor',
      params: {
        businessModel,
        businessModelName,
        tasteIds: JSON.stringify(tasteIds),
        dietIds: JSON.stringify(dietIds),
        foodTypeIds: JSON.stringify(foodTypeIds),
        tasteNames: JSON.stringify(tasteNames),
        dietNames: JSON.stringify(dietNames),
        foodTypeNames: JSON.stringify(foodTypeNames),
        imageUrl: imageUrl || '',
        placeName,
        ownerName,
        address,
        email,
        coordinates,
        openingTime: formatTime(openingTime),
        averagePrice,
        mainDish,
        phoneNumber,
        description, // Pass description
      },
    });
  };

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
          <Text style={styles.title}>Tạo Quán Ăn</Text>
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
              placeholder="Nhập mô tả quán ăn (ví dụ: Quán chuyên món Việt, không gian ấm cúng)"
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
              <Text style={{ color: openingTime ? Colors[colorScheme].text : Colors[colorScheme].icon, marginTop: 13, fontSize: 17 }}>
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
              <Text style={styles.submitButtonText}>Tạo quán ăn</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CreateRestaurant;