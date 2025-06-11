import AlertModal from "@/components/AlertModal";
import { Colors } from "@/constants/Colors";
import { Fonts, getFontMap } from "@/constants/Fonts";
import { CheckCreatedSnackplaceApi } from "@/services/merchants.services";
import { getSnackPlaceStats } from "@/services/snackplace.services";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Interface for snack place stats
interface SnackPlaceStats {
  averageRating: number;
  numOfComments: number;
  recommendPercent: number;
  numOfClicks: number;
}

// Interface for card data
interface CardData {
  value: number | string;
  label: string;
}

export default function DataScreen() {
  // Load fonts
  const [fontsLoaded] = useFonts(getFontMap());

  // State for controlling AlertModal visibility
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // State for snack place stats
  const [stats, setStats] = useState<SnackPlaceStats>({
    averageRating: 0,
    numOfComments: 0,
    recommendPercent: 0,
    numOfClicks: 0,
  });
  const [snackPlaceId, setSnackPlaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch snackPlaceId from CheckCreatedSnackplaceApi
  useEffect(() => {
    const fetchSnackPlaceData = async () => {
      try {
        const response = await CheckCreatedSnackplaceApi();
        const id = response?.data?.snackPlaceId;
        if (id) {
          setSnackPlaceId(id);
        } else {
          setError("Không tìm thấy ID quán ăn từ thông tin quán.");
        }
      } catch (error) {
        console.error("CheckCreatedSnackplaceApi Error:", error);
        setError("Không thể lấy thông tin quán ăn. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSnackPlaceData();
  }, []);

  // Fetch snack place stats using snackPlaceId
  useEffect(() => {
    const fetchStats = async () => {
      if (!snackPlaceId) return;

      try {
        setIsLoading(true);
        const response = await getSnackPlaceStats(snackPlaceId);
        setStats(response.data);
        setError(null);
      } catch (error) {
        console.error("getSnackPlaceStats Error:", error);
        setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [snackPlaceId]);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSnackPlaceId(null);
    setStats({
      averageRating: 0,
      numOfComments: 0,
      recommendPercent: 0,
      numOfClicks: 0,
    });
    setError(null);
    setIsLoading(true);

    try {
      const response = await CheckCreatedSnackplaceApi();
      const id = response?.data?.snackPlaceId;
      if (id) {
        setSnackPlaceId(id);
      } else {
        setError("Không tìm thấy ID quán ăn từ thông tin quán.");
      }
    } catch (error) {
      console.error("Refresh CheckCreatedSnackplaceApi Error:", error);
      setError("Không thể làm mới dữ liệu. Vui lòng thử lại.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Show centered loading spinner while fonts or data are loading
  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primaryText} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text
          style={[
            styles.subtitle,
            { fontFamily: Fonts.Comfortaa.Medium, color: Colors.light.error },
          ]}
        >
          {error}
        </Text>
      </View>
    );
  }

  // Handle button press to show modal
  const handleReplyComments = () => {
    setIsModalVisible(true);
  };

  // Handle modal confirm (dismiss modal)
  const handleModalConfirm = () => {
    setIsModalVisible(false);
  };

  // Dynamic card data based on API response
  const cardData: CardData[] = [
    { value: stats.averageRating.toFixed(1), label: "Đánh giá sao" },
    { value: stats.numOfComments, label: "Lượt đánh giá" },
    { value: stats.recommendPercent, label: "Đề xuất" },
    { value: stats.numOfClicks, label: "Lượt truy cập" },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[Colors.light.primaryText]}
          tintColor={Colors.light.primaryText}
        />
      }
    >
      <Text style={[styles.title, { fontFamily: Fonts.Baloo2.Bold }]}>
        Báo cáo số liệu
      </Text>
      <Text style={[styles.subtitle, { fontFamily: Fonts.Comfortaa.Medium }]}>
        Số liệu hôm nay
      </Text>
      <View style={styles.cardsContainer}>
        {cardData.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.headerContainer}>
              {item.label === "Đánh giá sao" ? (
                <Ionicons
                  name="star"
                  size={28}
                  color={Colors.light.icon}
                  style={styles.icon}
                />
              ) : (
                <MaterialIcons
                  name={
                    item.label === "Lượt đánh giá"
                      ? "rate-review"
                      : item.label === "Đề xuất"
                      ? "lightbulb"
                      : "visibility"
                  }
                  size={28}
                  color={Colors.light.icon}
                  style={styles.icon}
                />
              )}
              <Text
                style={[styles.label, { fontFamily: Fonts.Comfortaa.Regular }]}
              >
                {item.label}
              </Text>
            </View>
            <Text style={[styles.value, { fontFamily: Fonts.Baloo2.Bold }]}>
              {item.label === "Đánh giá sao"
                ? `${item.value}/5`
                : item.label === "Đề xuất"
                ? `${item.value}%`
                : item.value}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.replyButton} onPress={handleReplyComments}>
        <Text
          style={[
            styles.replyButtonText,
            { fontFamily: Fonts.Comfortaa.Medium },
          ]}
        >
          Trả lời bình luận của khách hàng
        </Text>
      </TouchableOpacity>

      <AlertModal
        visible={isModalVisible}
        title="Thông báo"
        message="Tính năng chỉ dành cho Gói cơ bản"
        isSuccess={false}
        showCancel={false}
        confirmText="OK"
        onConfirm={handleModalConfirm}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    color: Colors.light.primaryText,
    textAlign: "center",
    marginTop: 40,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.light.blackText,
    textAlign: "left",
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 4,
  },
  card: {
    width: "48%",
    backgroundColor: Colors.light.grayBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 3,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  value: {
    fontSize: 36,
    color: Colors.light.primaryText,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: Colors.light.blackText,
    textAlign: "center",
  },
  replyButton: {
    backgroundColor: Colors.light.primaryText,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 8,
    elevation: 1,
  },
  replyButtonText: {
    fontSize: 16,
    color: Colors.light.grayBackground,
    textAlign: "center",
  },
});