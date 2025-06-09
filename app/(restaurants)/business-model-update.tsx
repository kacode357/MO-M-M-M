import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { searchBusinessModels } from '@/services/business.services';
import { styles } from '@/styles/BusinessModelStyles';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface BusinessModel {
  id: string;
  name: string;
}

const BusinessModelUpdate = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const params = useLocalSearchParams();

  const [businessModels, setBusinessModels] = useState<BusinessModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch business models from API
  useEffect(() => {
    const fetchBusinessModels = async () => {
      try {
        setLoading(true);
        const response = await searchBusinessModels({
          pageNum: 1,
          pageSize: 10,
          searchKeyword: '',
          status: true,
        });
        setBusinessModels(response.data.pageData || []);
      } catch (err) {
        console.error('Error fetching business models:', err);
        setError('Không thể tải danh sách mô hình kinh doanh.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessModels();
  }, []);

  const handleSelect = (model: BusinessModel) => {
    router.push({
      pathname: '/(restaurants)/edit',
      params: {
        id: params.id || '', // Ensure id is passed back
        businessModel: model.id,
        businessModelName: model.name,
        tasteIds: params.tasteIds || JSON.stringify([]),
        dietIds: params.dietIds || JSON.stringify([]),
        foodTypeIds: params.foodTypeIds || JSON.stringify([]),
        tasteNames: params.tasteNames || JSON.stringify([]),
        dietNames: params.dietNames || JSON.stringify([]),
        foodTypeNames: params.foodTypeNames || JSON.stringify([]),
        imageUrl: params.imageUrl || '',
        placeName: params.placeName || '',
        ownerName: params.ownerName || '',
        address: params.address || '',
        email: params.email || '',
        coordinates: params.coordinates || '',
        openingTime: params.openingTime || '',
        averagePrice: params.averagePrice || '',
        mainDish: params.mainDish || '',
        phoneNumber: params.phoneNumber || '',
        description: params.description || '',
      },
    });
  };

  const renderItem = ({ item }: { item: BusinessModel }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleSelect(item)}
    >
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
          </TouchableOpacity>
          <Text style={styles.title}>Chọn Mô Hình Kinh Doanh</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].primaryText} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
          </TouchableOpacity>
          <Text style={styles.title}>Chọn Mô Hình Kinh Doanh</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>
        <Text style={styles.title}>Chọn Mô Hình Kinh Doanh</Text>
      </View>
      <FlatList
        data={businessModels}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={true}
      />
    </View>
  );
};

export default BusinessModelUpdate;