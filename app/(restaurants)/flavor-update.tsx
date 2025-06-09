import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { searchDiet } from '@/services/diet.services';
import { searchFoodType } from '@/services/foodtype.services';
import { searchTaste } from '@/services/taste.services';
import { styles } from '@/styles/FlavorStyles';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Item {
  id: string;
  name: string;
}

const FlavorUpdate = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const params = useLocalSearchParams();

  // State for API data
  const [tastes, setTastes] = useState<Item[]>([]);
  const [diets, setDiets] = useState<Item[]>([]);
  const [foodTypes, setFoodTypes] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for selected IDs
  const [selectedTasteIds, setSelectedTasteIds] = useState<string[]>([]);
  const [selectedDietIds, setSelectedDietIds] = useState<string[]>([]);
  const [selectedFoodTypeIds, setSelectedFoodTypeIds] = useState<string[]>([]);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tasteResponse, dietResponse, foodTypeResponse] = await Promise.all([
          searchTaste({ pageNum: 1, pageSize: 100, searchKeyword: '', status: true }),
          searchDiet({ pageNum: 1, pageSize: 100, searchKeyword: '', status: true }),
          searchFoodType({ pageNum: 1, pageSize: 100, searchKeyword: '', status: true }),
        ]);

        setTastes(tasteResponse.data.pageData || []);
        setDiets(dietResponse.data.pageData || []);
        setFoodTypes(foodTypeResponse.data.pageData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Pre-populate selections from params
  useEffect(() => {
    if (params.tasteIds) {
      try {
        setSelectedTasteIds(JSON.parse(params.tasteIds as string));
      } catch (error) {
        console.error('Error parsing tasteIds:', error);
      }
    }
    if (params.dietIds) {
      try {
        setSelectedDietIds(JSON.parse(params.dietIds as string));
      } catch (error) {
        console.error('Error parsing dietIds:', error);
      }
    }
    if (params.foodTypeIds) {
      try {
        setSelectedFoodTypeIds(JSON.parse(params.foodTypeIds as string));
      } catch (error) {
        console.error('Error parsing foodTypeIds:', error);
      }
    }
  }, [params.tasteIds, params.dietIds, params.foodTypeIds]);

  const toggleSelection = (
    itemId: string,
    selectedItems: string[],
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleConfirm = () => {
    // Create lists of names corresponding to selected IDs
    const selectedTasteNames = tastes
      .filter((taste) => selectedTasteIds.includes(taste.id))
      .map((taste) => taste.name);
    const selectedDietNames = diets
      .filter((diet) => selectedDietIds.includes(diet.id))
      .map((diet) => diet.name);
    const selectedFoodTypeNames = foodTypes
      .filter((foodType) => selectedFoodTypeIds.includes(foodType.id))
      .map((foodType) => foodType.name);

    router.push({
      pathname: '/(restaurants)/edit',
      params: {
        id: params.id || '', // Ensure id is passed back
        businessModel: params.businessModel || '',
        businessModelName: params.businessModelName || '',
        tasteIds: JSON.stringify(selectedTasteIds),
        dietIds: JSON.stringify(selectedDietIds),
        foodTypeIds: JSON.stringify(selectedFoodTypeIds),
        tasteNames: JSON.stringify(selectedTasteNames),
        dietNames: JSON.stringify(selectedDietNames),
        foodTypeNames: JSON.stringify(selectedFoodTypeNames),
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

  const renderItem = ({
    item,
    selectedItems,
    setSelectedItems,
  }: {
    item: Item;
    selectedItems: string[];
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  }) => (
    <TouchableOpacity
      style={[styles.item, selectedItems.includes(item.id) && styles.itemSelected]}
      onPress={() => toggleSelection(item.id, selectedItems, setSelectedItems)}
    >
      <Text style={[styles.itemText, selectedItems.includes(item.id) && styles.itemTextSelected]}>
        {item.name}
      </Text>
      {selectedItems.includes(item.id) && (
        <Ionicons name="checkmark" size={20} color={Colors[colorScheme].whiteText} />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].primaryText} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
          }}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
  
        <Text style={styles.title}>Chọn Khẩu Vị Món Ăn</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>Khẩu vị</Text>
        <FlatList
          data={tastes}
          renderItem={({ item }) =>
            renderItem({ item, selectedItems: selectedTasteIds, setSelectedItems: setSelectedTasteIds })
          }
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
        <Text style={styles.sectionTitle}>Chế độ ăn</Text>
        <FlatList
          data={diets}
          renderItem={({ item }) =>
            renderItem({ item, selectedItems: selectedDietIds, setSelectedItems: setSelectedDietIds })
          }
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
        <Text style={styles.sectionTitle}>Loại món ăn</Text>
        <FlatList
          data={foodTypes}
          renderItem={({ item }) =>
            renderItem({
              item,
              selectedItems: selectedFoodTypeIds,
              setSelectedItems: setSelectedFoodTypeIds,
            })
          }
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Xác nhận</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default FlavorUpdate;