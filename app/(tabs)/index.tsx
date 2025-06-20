import AlertModal from "@/components/AlertModal";
import { Colors } from "@/constants/Colors";
import { Fonts, getFontMap } from "@/constants/Fonts";
import { CheckCreatedSnackplaceApi } from "@/services/merchants.services";
import { getSnackPlaceClicks, getSnackPlaceStats } from "@/services/snackplace.services";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

//=== CÁC INTERFACE VÀ HẰNG SỐ (ĐÃ CẬP NHẬT) ===

// FIX: Định nghĩa kiểu dữ liệu chi tiết cho phản hồi API
interface ClickDetail {
  userId: string;
  clickedAt: string;
  userName: string;
  image: string | null;
}

interface ApiClickDay {
  day: string;
  totalClicks: number;
  dateGroup: ClickDetail[];
}

interface ClicksApiResponse {
  data: {
    clicksByDayOfWeek: ApiClickDay[];
    endDate: string;
    startDate: string;
    snackPlaceId: string;
    uniqueClickCount: number;
  };
  message: string;
  status: number;
}

interface SnackPlaceStats {
  averageRating: number;
  numOfComments: number;
  recommendPercent: number;
  numOfClicks: number;
}

interface ChartDayData {
  day: string;
  totalClicks: number;
}

interface BarChartProps {
  clickData: ChartDayData[] | null;
  isLoading: boolean;
}

// FIX: Sử dụng Generics để định nghĩa kiểu cho card item một cách an toàn
interface CardDataItem<T extends string | number> {
  id: string;
  value: T;
  label: string;
  icon: React.ReactNode;
  format?: (value: T) => string;
}

const VIETNAMESE_DAYS: { [key: string]: string } = {
  Sunday: "Chủ nhật", Monday: "Thứ 2", Tuesday: "Thứ 3",
  Wednesday: "Thứ 4", Thursday: "Thứ 5", Friday: "Thứ 6", Saturday: "Thứ 7",
};

//=== ĐỊNH NGHĨA COMPONENT BIỂU ĐỒ (BARCHART) ===
const BarChart = React.memo(({ clickData, isLoading }: BarChartProps) => {
  // ... (Nội dung không đổi)
  const chartData = useMemo(() => {
    if (!clickData) return [];
    return clickData.filter(day => day.totalClicks > 0);
  }, [clickData]);

  if (isLoading) {
    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { fontFamily: Fonts.Baloo2.Bold }]}>Lượt click theo ngày</Text>
        <ActivityIndicator size="small" color={Colors.light.primaryText} />
      </View>
    );
  }

  if (chartData.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { fontFamily: Fonts.Baloo2.Bold }]}>Lượt click theo ngày</Text>
        <Text style={[styles.label, { fontFamily: Fonts.Comfortaa.Regular }]}>Không có dữ liệu để hiển thị</Text>
      </View>
    );
  }

  const chartHeight = 200;
  const chartWidth = Dimensions.get("window").width - 32;
  const numBars = chartData.length;
  const barWidth = Math.min(chartWidth / (numBars * 1.5), 50);
  const maxClicks = Math.max(...chartData.map(day => day.totalClicks), 1);
  const yAxisTicks = Array.from({ length: 6 }, (_, i) => Math.round(maxClicks * (1 - i / 5)));

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
        <View style={[styles.barsContainer, { justifyContent: "space-around" }]}>
          {chartData.map((day, index) => {
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
});

BarChart.displayName = 'BarChart';


//=== ĐỊNH NGHĨA COMPONENT CHÍNH (DATASCREEN) ===
export default function DataScreen() {
  const [fontsLoaded] = useFonts(getFontMap());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [stats, setStats] = useState<SnackPlaceStats | null>(null);
  const [clickData, setClickData] = useState<ChartDayData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const snackplaceResponse = await CheckCreatedSnackplaceApi();
      const snackPlaceId = snackplaceResponse?.data?.snackPlaceId;

      if (!snackPlaceId) {
        throw new Error("Không tìm thấy thông tin quán ăn của bạn.");
      }
      
      const today = new Date();
      const startDate = new Date(new Date().setDate(today.getDate() - 5)).toLocaleDateString("en-CA");
      const endDate = today.toLocaleDateString("en-CA");

      const [statsResponse, clicksResponse] = await Promise.all([
        getSnackPlaceStats(snackPlaceId),
        getSnackPlaceClicks(startDate, endDate) as Promise<ClicksApiResponse>, // FIX: Ép kiểu kết quả trả về
      ]);
      
      setStats(statsResponse.data);

      const clicksByDate = new Map<string, number>();
      
      // FIX: Cung cấp kiểu dữ liệu rõ ràng cho 'day'
      clicksResponse.data.clicksByDayOfWeek.forEach((day: ApiClickDay) => {
        if (day.dateGroup.length > 0) {
          const date = new Date(day.dateGroup[0].clickedAt).toLocaleDateString("en-CA");
          clicksByDate.set(date, day.totalClicks);
        }
      });
      
      const last6Days = Array.from({ length: 6 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d;
      }).reverse();
      
      const formattedClickData = last6Days.map(date => {
          const dateString = date.toLocaleDateString('en-CA');
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
          return {
              day: VIETNAMESE_DAYS[dayName] || 'N/A',
              totalClicks: clicksByDate.get(dateString) || 0,
          };
      });

      setClickData(formattedClickData);

    } catch (e: any) {
      setError(e.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
      setStats(null);
      setClickData(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  // FIX: Sử dụng CardDataItem<T> để đảm bảo an toàn kiểu
  const cardData = useMemo(() => {
    if (!stats) return [];
    
    // Mảng này bây giờ hoàn toàn an toàn về kiểu dữ liệu
    const data: CardDataItem<string | number>[] = [
      { id: "rating", value: stats.averageRating.toFixed(1), label: "Đánh giá sao", icon: <Ionicons name="star" size={28} color={Colors.light.icon} style={styles.icon} />, format: v => `${v}/5` },
      { id: "reviews", value: stats.numOfComments, label: "Lượt đánh giá", icon: <MaterialIcons name="rate-review" size={28} color={Colors.light.icon} style={styles.icon} /> },
      { id: "recommend", value: stats.recommendPercent, label: "Đề xuất", icon: <MaterialIcons name="lightbulb" size={28} color={Colors.light.icon} style={styles.icon} />, format: v => `${v}%` },
      { id: "clicks", value: stats.numOfClicks, label: "Lượt truy cập", icon: <MaterialIcons name="visibility" size={28} color={Colors.light.icon} style={styles.icon} /> },
    ];
    return data;
  }, [stats]);

  if (!fontsLoaded || (isLoading && !isRefreshing)) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={Colors.light.primaryText} /></View>;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.subtitle, { fontFamily: Fonts.Comfortaa.Medium, color: Colors.light.error, textAlign: 'center' }]}>{error}</Text>
        <TouchableOpacity style={styles.replyButton} onPress={fetchData}>
          <Text style={[styles.replyButtonText, { fontFamily: Fonts.Comfortaa.Medium }]}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[Colors.light.primaryText]} tintColor={Colors.light.primaryText} />}
    >
      <Text style={[styles.title, { fontFamily: Fonts.Baloo2.Bold }]}>Báo cáo số liệu</Text>
      <Text style={[styles.subtitle, { fontFamily: Fonts.Baloo2.Bold }]}>Số liệu tổng quan</Text>
      <View style={styles.cardsContainer}>
        {cardData.map(item => (
          <View key={item.id} style={styles.card}>
            <View style={styles.headerContainer}>
              {item.icon}
              <Text style={[styles.label, { fontFamily: Fonts.Comfortaa.Regular }]}>{item.label}</Text>
            </View>
            <Text style={[styles.value, { fontFamily: Fonts.Baloo2.Bold }]}>
              {/* FIX: Không cần 'as any' nữa, code đã an toàn */}
              {item.format ? item.format(item.value as any) : item.value}
            </Text>
          </View>
        ))}
      </View>
      
      <BarChart clickData={clickData} isLoading={isLoading} />

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

//=== TẤT CẢ STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: 'white' },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'white' },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16, backgroundColor: 'white' },
  title: { fontSize: 32, color: Colors.light.primaryText, textAlign: "center", marginTop: 40, marginBottom: 16 },
  subtitle: { fontSize: 18, color: Colors.light.blackText, textAlign: "left", marginBottom: 4 },
  cardsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 4, rowGap: 12 },
  card: { width: "48%", backgroundColor: Colors.light.grayBackground, borderRadius: 12, padding: 12, elevation: 3 },
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
  barWrapper: { alignItems: "center", flex: 1 },
  bar: { borderRadius: 4 },
  barLabel: { fontSize: 12, color: Colors.light.blackText, position: "absolute", top: -16, alignSelf: "center" },
  xAxisLabel: { fontSize: 12, color: Colors.light.blackText, marginTop: 4, textAlign: "center" },
});