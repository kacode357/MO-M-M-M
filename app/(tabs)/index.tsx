import AlertModal from "@/components/AlertModal";
import { Colors } from "@/constants/Colors";
import { Fonts, getFontMap } from "@/constants/Fonts";
import { CheckCreatedSnackplaceApi } from "@/services/merchants.services";
import { getSnackPlaceClicks, getSnackPlaceStats } from "@/services/snackplace.services";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SnackPlaceStats {
  averageRating: number;
  numOfComments: number;
  recommendPercent: number;
  numOfClicks: number;
}

interface ClickDetail {
  userId: string;
  clickedAt: string;
  userName: string;
  image: string | null;
}

interface ClickDay {
  day: string; // English day name from API (e.g., "Monday")
  totalClicks: number;
  dateGroup: ClickDetail[];
}

interface ClickData {
  data: {
    clicksByDayOfWeek: ClickDay[];
    endDate: string;
    startDate: string;
    snackPlaceId: string;
    uniqueClickCount: number;
  };
  message: string;
  status: number;
}

interface CardData {
  value: number | string;
  label: string;
}

export default function DataScreen() {
  const [fontsLoaded] = useFonts(getFontMap());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [stats, setStats] = useState<SnackPlaceStats>({ averageRating: 0, numOfComments: 0, recommendPercent: 0, numOfClicks: 0 });
  const [snackPlaceId, setSnackPlaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clickData, setClickData] = useState<ClickData | null>(null);

  // Hàm lấy ID quán ăn
  const fetchSnackPlaceData = useCallback(async () => {
    try {
      const response = await CheckCreatedSnackplaceApi();
      const id = response?.data?.snackPlaceId;
      if (id) {
        setSnackPlaceId(id);
      } else {
        setError("Không tìm thấy ID quán ăn.");
      }
    } catch {
      setError("Không thể lấy thông tin quán ăn.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hàm lấy thống kê quán ăn
  const fetchStats = useCallback(async () => {
    if (!snackPlaceId) return;
    try {
      setIsLoading(true);
      const response = await getSnackPlaceStats(snackPlaceId);
      setStats(response.data);
      setError(null);
    } catch {
      setError("Không thể tải dữ liệu thống kê.");
    } finally {
      setIsLoading(false);
    }
  }, [snackPlaceId]);

  // Hàm lấy dữ liệu lượt click cho 6 ngày qua
  const fetchClicks = useCallback(async () => {
    if (!snackPlaceId) return;
    try {
      setIsLoading(true);
      const today = new Date();
      const endDate = today.toLocaleDateString("en-CA"); // Định dạng YYYY-MM-DD
      const startDate = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toLocaleDateString("en-CA"); // 6 ngày trước
      const response = await getSnackPlaceClicks(startDate, endDate);
      setClickData(response);
      setError(null);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu lượt click:", error);
      setError("Không thể tải dữ liệu lượt click cho 6 ngày qua.");
    } finally {
      setIsLoading(false);
    }
  }, [snackPlaceId]);

  // Hàm làm mới dữ liệu
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setSnackPlaceId(null);
    setStats({ averageRating: 0, numOfComments: 0, recommendPercent: 0, numOfClicks: 0 });
    setClickData(null);
    setError(null);
    setIsLoading(true);
    await fetchSnackPlaceData(); // Kích hoạt lại fetchSnackPlaceData để lấy ID mới
    setIsRefreshing(false);
  }, [fetchSnackPlaceData]);

  // Gọi API khi component mount
  useEffect(() => {
    fetchSnackPlaceData();
  }, [fetchSnackPlaceData]);

  // Gọi fetchStats và fetchClicks khi snackPlaceId thay đổi
  useEffect(() => {
    if (snackPlaceId) {
      fetchStats();
      fetchClicks();
    }
  }, [snackPlaceId, fetchStats, fetchClicks]);

  // Hàm chuyển đổi ngày tiếng Anh sang tiếng Việt và lấy ngày trước đó
  const getPreviousDays = useCallback((currentDate: Date, numDays: number) => {
    const days = [];
    const vietnameseDays = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    for (let i = numDays - 1; i >= 0; i--) { // Thứ tự thời gian (sớm nhất đến muộn nhất)
      const date = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
      const dayIndex = date.getDay();
      days.push({
        vietnamese: vietnameseDays[dayIndex],
        date: date.toLocaleDateString("en-CA"), // e.g., 2025-06-07
      });
    }
    return days;
  }, []);

  // Component biểu đồ cột
  const BarChart = () => {
    const expectedDays = getPreviousDays(new Date(), 6);

    const englishToVietnamese: { [key: string]: string } = {
      Sunday: "Chủ nhật",
      Monday: "Thứ 2",
      Tuesday: "Thứ 3",
      Wednesday: "Thứ 4",
      Thursday: "Thứ 5",
      Friday: "Thứ 6",
      Saturday: "Thứ 7",
    };

    const sortedData = useMemo(() => {
      if (!clickData?.data.clicksByDayOfWeek.length) return [];
      return expectedDays.map(expected => {
        const apiDay = clickData.data.clicksByDayOfWeek.find(day => {
          if (!day.dateGroup.length) {
            return englishToVietnamese[day.day] === expected.vietnamese;
          }
          try {
            const clickDate = new Date(day.dateGroup[0].clickedAt).toLocaleDateString("en-CA");
            return clickDate === expected.date;
          } catch {
            console.error(`Invalid clickedAt date for ${day.day}`);
            return false;
          }
        });
        return {
          day: expected.vietnamese,
          totalClicks: apiDay ? apiDay.totalClicks : 0,
          dateGroup: apiDay ? apiDay.dateGroup : [],
        };
      });
    }, [clickData, expectedDays]);

    if (isLoading) {
      return (
        <View style={styles.chartContainer}>
          <Text style={[styles.chartTitle, { fontFamily: Fonts.Baloo2.Bold }]}>Lượt click theo ngày</Text>
          <ActivityIndicator size="small" color={Colors.light.primaryText} />
        </View>
      );
    }

    if (!sortedData.length || sortedData.every(day => day.totalClicks === 0)) {
      return (
        <View style={styles.chartContainer}>
          <Text style={[styles.chartTitle, { fontFamily: Fonts.Baloo2.Bold }]}>Lượt click theo ngày</Text>
          <Text style={[styles.label, { fontFamily: Fonts.Comfortaa.Regular }]}>Không có dữ liệu để hiển thị</Text>
        </View>
      );
    }

    const chartHeight = 200;
    const chartWidth = Dimensions.get("window").width - 32;
    // Chỉ tính các thanh có totalClicks > 0 để xác định số lượng thanh thực tế
    const numBars = sortedData.filter(day => day.totalClicks > 0).length;
    // Điều chỉnh barWidth dựa trên số lượng thanh có dữ liệu
    const barWidth = Math.min(chartWidth / (numBars > 0 ? numBars * 1.5 : 1), 50); // Đảm bảo numBars > 0 để tránh chia cho 0
    const maxClicks = Math.max(...sortedData.map(day => day.totalClicks), 1);
    const yAxisTicks = Array.from(
      { length: 6 },
      (_, i) => Math.round(maxClicks * (1 - i / 5))
    );

    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { fontFamily: Fonts.Baloo2.Bold }]}>Lượt click theo ngày</Text>
        <View style={styles.chart}>
          <View style={styles.yAxis}>
            {yAxisTicks.map((tick, index) => ( 
              <Text key={`y-axis-tick-${tick}-${index}`} style={[styles.axisLabel, { fontFamily: Fonts.Comfortaa.Regular }]}>
                {tick}
              </Text>
            ))}
          </View>
          <View style={[styles.barsContainer, { justifyContent: numBars > 1 ? "space-around" : "center" }]}>
            {sortedData.map((day, index) => {
              if (day.totalClicks === 0) return null;
              const barHeight = (day.totalClicks / maxClicks) * chartHeight;
              return (
                <View key={`${day.day}-${index}`} style={styles.barWrapper}>
                  <Text style={[styles.barLabel, { fontFamily: Fonts.Comfortaa.Regular }]}>
                    {day.totalClicks}
                  </Text>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        width: barWidth,
                        backgroundColor: Colors.light.primaryText,
                      },
                    ]}
                    accessibilityLabel={`Lượt click cho ${day.day}: ${day.totalClicks}`}
                  />
                  <Text style={[styles.xAxisLabel, { fontFamily: Fonts.Comfortaa.Regular }]}>{day.day}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

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
        <Text style={[styles.subtitle, { fontFamily: Fonts.Comfortaa.Medium, color: Colors.light.error }]}>
          {error}
        </Text>
        <TouchableOpacity style={styles.replyButton} onPress={fetchSnackPlaceData}> 
          <Text style={[styles.replyButtonText, { fontFamily: Fonts.Comfortaa.Medium }]}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cardData: CardData[] = [
    { value: stats.averageRating.toFixed(1), label: "Đánh giá sao" },
    { value: stats.numOfComments, label: "Lượt đánh giá" },
    { value: stats.recommendPercent, label: "Đề xuất" },
    { value: stats.numOfClicks, label: "Lượt truy cập" },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[Colors.light.primaryText]} tintColor={Colors.light.primaryText} />}
    >
      <Text style={[styles.title, { fontFamily: Fonts.Baloo2.Bold }]}>Báo cáo số liệu</Text>
      <Text style={[styles.subtitle, { fontFamily: Fonts.Baloo2.Bold }]}>Số liệu hôm nay</Text>
      <View style={styles.cardsContainer}>
        {cardData.map((item, index) => (
          <View key={item.label} style={styles.card}> 
            <View style={styles.headerContainer}>
              {item.label === "Đánh giá sao" ? (
                <Ionicons name="star" size={28} color={Colors.light.icon} style={styles.icon} />
              ) : (
                <MaterialIcons
                  name={item.label === "Lượt đánh giá" ? "rate-review" : item.label === "Đề xuất" ? "lightbulb" : "visibility"}
                  size={28}
                  color={Colors.light.icon}
                  style={styles.icon}
                />
              )}
              <Text style={[styles.label, { fontFamily: Fonts.Comfortaa.Regular }]}>{item.label}</Text>
            </View>
            <Text style={[styles.value, { fontFamily: Fonts.Baloo2.Bold }]}>
              {item.label === "Đánh giá sao" ? `${item.value}/5` : item.label === "Đề xuất" ? `${item.value}%` : item.value}
            </Text>
          </View>
        ))}
      </View>
      <BarChart />
      <TouchableOpacity style={styles.replyButton} onPress={() => setIsModalVisible(true)}>
        <Text style={[styles.replyButtonText, { fontFamily: Fonts.Comfortaa.Medium }]}>Trả lời bình luận của khách hàng</Text>
      </TouchableOpacity>
      <AlertModal
        visible={isModalVisible}
        title="Thông báo"
        message="Tính năng chỉ dành cho Gói cơ bản"
        isSuccess={false}
        showCancel={false}
        confirmText="OK"
        onConfirm={() => setIsModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 32, color: Colors.light.primaryText, textAlign: "center", marginTop: 40 },
  subtitle: { fontSize: 18, color: Colors.light.blackText, textAlign: "left", marginBottom: 4 },
  cardsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 4 },
  card: { width: "48%", backgroundColor: Colors.light.grayBackground, borderRadius: 12, padding: 12, marginBottom: 5, elevation: 3 },
  headerContainer: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  icon: { marginRight: 8 },
  value: { fontSize: 36, color: Colors.light.primaryText, textAlign: "center" },
  label: { fontSize: 16, color: Colors.light.blackText, textAlign: "center" },
  replyButton: { backgroundColor: Colors.light.primaryText, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, alignItems: "center", marginTop: 8, elevation: 1 },
  replyButtonText: { fontSize: 16, color: Colors.light.grayBackground, textAlign: "center" },
  chartContainer: { marginVertical: 16 },
  chartTitle: { fontSize: 18, color: Colors.light.blackText, textAlign: "left", marginBottom: 8 },
  chart: { flexDirection: "row", height: 220 },
  yAxis: { justifyContent: "space-between", paddingRight: 8, paddingBottom: 20 },
  axisLabel: { fontSize: 12, color: Colors.light.blackText, textAlign: "right" },
  barsContainer: { flex: 1, flexDirection: "row", alignItems: "flex-end" },
  barWrapper: { alignItems: "center" },
  bar: { borderRadius: 4 },
  barLabel: { fontSize: 12, color: Colors.light.blackText, position: "absolute", top: -16, alignSelf: "center" },
  xAxisLabel: { fontSize: 12, color: Colors.light.blackText, marginTop: 4, textAlign: "center" },
});