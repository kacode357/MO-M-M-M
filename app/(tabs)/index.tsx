import AlertModal from "@/components/AlertModal";
import { Colors } from "@/constants/Colors";
import { Fonts, getFontMap } from "@/constants/Fonts";
import { CheckCreatedSnackplaceApi } from "@/services/merchants.services";
import { getSnackPlaceClicks, getSnackPlaceStats } from "@/services/snackplace.services"; // Import new API
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";

// Screen width for responsive chart sizing
const screenWidth = Dimensions.get("window").width;

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date) => date.toISOString().split("T")[0];

export default function DataScreen() {
  // Load fonts
  const [fontsLoaded] = useFonts(getFontMap());

  // State for controlling AlertModal visibility
  const [isModalVisible, setIsModalVisible] = useState(false);

  // State for snack place stats
  const [stats, setStats] = useState({
    averageRating: 0,
    numOfComments: 0,
    numOfRecommends: 0,
    numOfClicks: 0,
  });
  const [snackPlaceId, setSnackPlaceId] = useState<string | null>(null);
  const [clickData, setClickData] = useState<any[]>([]); // State for click statistics
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch snackPlaceId from CheckCreatedSnackplaceApi
  useEffect(() => {
    const fetchSnackPlaceData = async () => {
      try {
        const response = await CheckCreatedSnackplaceApi();
       
        const id = response?.data?.snackPlaceId;
        if (id) {
          setSnackPlaceId(id); // Store snackPlaceId
        } else {
          setError("Không tìm thấy ID quán ăn từ thông tin quán.");
        }
      } catch (error) {
        console.error("CheckCreatedSnackplaceApi Error:", error);
        setError("Không thể lấy thông tin quán ăn. Vui lòng thử lại.");
      }
    };
    fetchSnackPlaceData();
  }, []);

  // Fetch snack place stats and click data using snackPlaceId
  useEffect(() => {
    const fetchData = async () => {
      if (!snackPlaceId) return; // Wait until snackPlaceId is available

      try {
        setIsLoading(true);

        // Fetch stats
        const statsResponse = await getSnackPlaceStats(snackPlaceId);
        setStats(statsResponse.data);

        // Fetch click data with date range (last 7 days)
        const endDate = new Date(); // Current date: June 11, 2025, 01:50 PM +07
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 7); // 7 days prior: June 4, 2025
        const clickResponse = await getSnackPlaceClicks({
          snackPlaceId,
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        });
        const clicksByDay = clickResponse.data.clicksByDayOfWeek.map((day: any) => ({
          day: day.day,
          count: day.dateGroup.length, // Count of clicks per day
        }));
        console.log("Click Data:", clickResponse.data);
        setClickData(clicksByDay);

        setError(null);
      } catch (error) {
        console.error("Fetch Data Error:", error);
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [snackPlaceId]);

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

  // Prepare chart data from click statistics
  const chartData = {
    labels: clickData.map((day) => day.day),
    datasets: [
      {
        data: clickData.map((day) => day.count), // Number of clicks per day
      },
    ],
  };

  // Handle button press to show modal
  const handleReplyComments = () => {
    setIsModalVisible(true);
  };

  // Handle modal confirm (dismiss modal)
  const handleModalConfirm = () => {
    setIsModalVisible(false);
  };

  // Dynamic card data based on API response
  const cardData = [
    { value: stats.averageRating.toFixed(1), label: "Đánh giá sao" },
    { value: stats.numOfComments, label: "Lượt đánh giá" },
    { value: `${stats.numOfRecommends}%`, label: "Đề xuất" },
    { value: stats.numOfClicks, label: "Lượt truy cập" },
  ];

  return (
    <View style={styles.container}>
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
              {item.label === "Đánh giá sao" ? `${item.value}/5` : item.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Click Statistics Bar Chart */}
      <View style={styles.chartContainer}>
        <Text
          style={[styles.chartTitle, { fontFamily: Fonts.Comfortaa.Medium }]}
        >
          Lượt nhấp theo ngày trong tuần
        </Text>
        <BarChart
          data={chartData}
          width={screenWidth - 40}
          height={250}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: Colors.light.grayBackground,
            backgroundGradientFrom: Colors.light.grayBackground,
            backgroundGradientTo: Colors.light.grayBackground,
            decimalPlaces: 0,
            color: () => Colors.light.primaryText,
            labelColor: () => Colors.light.blackText,
            style: {
              borderRadius: 12,
            },
            propsForLabels: {
              fontSize: 12,
              fontWeight: "500",
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 12,
            paddingBottom: 12,
          }}
        />
      </View>

      {/* Reply to Customer Comments Button */}
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

      {/* Alert Modal */}
      <AlertModal
        visible={isModalVisible}
        title="Thông báo"
        message="Tính năng chỉ dành cho Gói cơ bản"
        isSuccess={false}
        showCancel={false}
        confirmText="OK"
        onConfirm={handleModalConfirm}
      />
    </View>
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
  chartContainer: {
    marginTop: 8,
    alignItems: "flex-start",
  },
  chartTitle: {
    fontSize: 18,
    color: Colors.light.blackText,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "left",
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