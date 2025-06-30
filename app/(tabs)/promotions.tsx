import { Colors } from '@/constants/Colors';
import { Fonts, getFontMap } from '@/constants/Fonts';
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { hasPackage } from '@/services/payment.services';
import { searchPremiumPackage } from '@/services/premiumPackage.services';

// Cập nhật interface PremiumPackage dựa trên log của bạn
interface PremiumPackage {
    id: number;
    name: string;
    price: number;
    descriptions: string[]; // Log cho thấy descriptions là một mảng string
    status: boolean;
    // createdAt và updatedAt không xuất hiện trong log của bạn, nên có thể bỏ đi
    // Nếu API có trả về, bạn có thể thêm lại: createdAt?: string; updatedAt?: string;
}

// Cập nhật interface PurchasedPackage dựa trên log của bạn
interface PurchasedPackage {
    userId: string;
    premiumPackageId: number;
    purchaseDate: string;
    isActive: boolean;
}

// Interface cho phản hồi API searchPremiumPackage
interface SearchPremiumPackageResponse {
    data: {
        pageData: PremiumPackage[];
        pageInfo: any; // pageInfo là một Object, bạn có thể định nghĩa chi tiết nếu cần
    };
    message: string;
    status: number;
}

// Interface cho phản hồi API hasPackage
interface HasPackageResponse {
    data: PurchasedPackage[]; // Giả định trả về một mảng các gói đã mua
    message: string;
    status: number;
}


const Promotions = () => {
    const [fontsLoaded] = useFonts(getFontMap());
    const [packages, setPackages] = useState<PremiumPackage[]>([]);
    const [purchasedPackages, setPurchasedPackages] = useState<PurchasedPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPremiumPackages = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [premiumPackagesResponse, purchasedPackagesResponse] = await Promise.allSettled([
                searchPremiumPackage({
                    pageNum: 1,
                    pageSize: 10,
                    searchKeyword: '',
                    status: true,
                }) as Promise<SearchPremiumPackageResponse>,
                hasPackage() as Promise<HasPackageResponse>,
            ]);

            // --- Xử lý searchPremiumPackage ---
            if (premiumPackagesResponse.status === 'fulfilled') {
                if (premiumPackagesResponse.value.status === 200 && premiumPackagesResponse.value.data && premiumPackagesResponse.value.data.pageData) {
                    console.log("Dữ liệu chi tiết gói Premium (pageData):", premiumPackagesResponse.value.data.pageData);
                    setPackages(premiumPackagesResponse.value.data.pageData);
                } else {
                    console.warn("API searchPremiumPackage trả về dữ liệu rỗng hoặc không đúng định dạng:", premiumPackagesResponse.value);
                    setPackages([]);
                }
            } else {
                console.error("API searchPremiumPackage bị từ chối:", premiumPackagesResponse.reason);
                setError("Không thể tải danh sách gói dịch vụ.");
            }

            // --- Xử lý hasPackage ---
            if (purchasedPackagesResponse.status === 'fulfilled') {
                if (purchasedPackagesResponse.value.status === 200 && purchasedPackagesResponse.value.data) {
                    console.log("Dữ liệu chi tiết gói đã mua (data):", purchasedPackagesResponse.value.data);
                    setPurchasedPackages(purchasedPackagesResponse.value.data);
                } else {
                    console.warn("API hasPackage trả về dữ liệu gói đã mua rỗng hoặc không đúng định dạng:", purchasedPackagesResponse.value);
                    setPurchasedPackages([]);
                }
            } else {
                console.error("API hasPackage bị từ chối:", purchasedPackagesResponse.reason);
                setError("Không thể kiểm tra trạng thái gói đã mua.");
            }

        } catch (err) {
            console.error("Lỗi tổng quát khi fetch gói dịch vụ:", err);
            setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPremiumPackages();
    }, [fetchPremiumPackages]);

    // Hàm kiểm tra xem gói đã được mua và kích hoạt chưa
    const isPackageActive = useCallback((packageId: number) => {
        // Đảm bảo purchasedPackages đã được tải và không rỗng
        if (!purchasedPackages || purchasedPackages.length === 0) {
            return false;
        }
        // Duyệt qua mảng các gói đã mua để tìm gói có premiumPackageId trùng khớp và isActive là true
        return purchasedPackages.some(
            (pkg) => pkg.premiumPackageId === packageId && pkg.isActive
        );
    }, [purchasedPackages]); // Thêm purchasedPackages vào dependencies để re-render khi dữ liệu thay đổi

    const handleLearnMore = useCallback((pkg: PremiumPackage) => {
        if (!router) {
            console.warn("Expo Router instance not available.");
            return;
        }

        const active = isPackageActive(pkg.id); // Lấy trạng thái hoạt động của gói

        // Nếu gói là "Tiêu Chuẩn" và đã kích hoạt, không chuyển hướng
        if (active && pkg.name.includes('Tiêu Chuẩn')) {
            console.log(`Gói "${pkg.name}" (ID: ${pkg.id}) đã được kích hoạt. Không chuyển hướng.`);
            return;
        }

        if (active) {
            // Gói đã được mua và đang hoạt động, chuyển đến trang tính năng/sử dụng
            console.log(`Gói "${pkg.name}" (ID: ${pkg.id}) đã được kích hoạt. Chuyển hướng đến trang sử dụng.`);
            if (pkg.name.includes('Cơ Bản')) {
                router.push({
                    pathname: '/(model-ai)/ai-create-image',
                    params: { id: pkg.id.toString(), packageName: pkg.name },
                });
            } else {
                console.warn(`Gói "${pkg.name}" đã được kích hoạt nhưng không có đường dẫn 'sử dụng ngay' cụ thể.`);
            }
        } else {
            // Gói chưa được mua hoặc chưa kích hoạt, chuyển đến trang mua/chi tiết
            console.log(`Gói "${pkg.name}" (ID: ${pkg.id}) chưa được kích hoạt. Chuyển hướng đến trang tìm hiểu thêm.`);
            if (pkg.name.includes('Cơ Bản')) {
                router.push({
                    pathname: '/(promotion)/basic-package',
                    params: { id: pkg.id.toString(), packageName: pkg.name },
                });
            } else if (pkg.name.includes('Tiêu Chuẩn')) {
                router.push({
                    pathname: '/(promotion)/standard-package',
                    params: { id: pkg.id.toString(), packageName: pkg.name },
                });
            }
        }
    }, [isPackageActive]);
    if (!fontsLoaded || isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primaryText} />
                <Text style={[styles.loadingText, { fontFamily: Fonts.Comfortaa.Regular }]}>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { fontFamily: Fonts.Comfortaa.Regular }]}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchPremiumPackages}>
                    <Text style={[styles.learnMoreText, { fontFamily: Fonts.Comfortaa.Medium }]}>Thử lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (packages.length === 0) {
        return (
            <View style={styles.noDataContainer}>
                <Text style={[styles.noDataText, { fontFamily: Fonts.Comfortaa.Regular }]}>Hiện chưa có gói dịch vụ nào để hiển thị.</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchPremiumPackages}>
                    <Text style={[styles.learnMoreText, { fontFamily: Fonts.Comfortaa.Medium }]}>Tải lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { fontFamily: Fonts.Baloo2.Bold }]}>Quảng bá thương hiệu</Text>
                <Text style={[styles.headerSubtitle, { fontFamily: Fonts.Comfortaa.Regular }]}>
                    Quảng bá thương hiệu của bạn hiệu quả hơn thông qua các gói dịch vụ của chúng tôi
                </Text>
            </View>

            {packages.map((pkg) => {
  const isActivePackage = isPackageActive(pkg.id);
  const isStandardAndActive = isActivePackage && pkg.name.includes('Tiêu Chuẩn');

  return (
    <View key={pkg.id} style={styles.packageCard}>
      <View style={styles.packageInfo}>
        <Text style={[styles.packageTitle, { fontFamily: Fonts.Baloo2.Bold }]}>{pkg.name}</Text>
        <Text style={[styles.packagePrice, { fontFamily: Fonts.Baloo2.Bold }]}>
          Giá: {pkg.price.toLocaleString('vi-VN')} VNĐ
        </Text>
        {pkg.descriptions && pkg.descriptions.length > 0 && (
          <View style={styles.descriptionContainer}>
            {pkg.descriptions.map((desc, idx) => (
              <Text key={idx} style={[styles.packageDescription, { fontFamily: Fonts.Comfortaa.Regular }]}>
                • {desc}
              </Text>
            ))}
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.learnMoreButton,
            isStandardAndActive && styles.disabledButton, // Thêm style cho trạng thái disabled
          ]}
          onPress={() => handleLearnMore(pkg)}
          disabled={isStandardAndActive} // Vô hiệu hóa nút nếu là gói Tiêu Chuẩn và đã kích hoạt
        >
          <Text style={[styles.learnMoreText, { fontFamily: Fonts.Comfortaa.Medium }]}>
            {isStandardAndActive ? 'Đã kích hoạt' : isActivePackage ? 'Sử dụng ngay' : 'Tìm hiểu thêm'}
          </Text>
        </TouchableOpacity>
      </View>
      <Image
        source={{
          uri: 'https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D',
        }}
        style={styles.packageImage}
      />
    </View>
  );
})}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
    },
    disabledButton: {
    backgroundColor: Colors.light.primaryText, // Màu xám để biểu thị trạng thái vô hiệu
  },
    loadingText: {
        fontSize: 16,
        color: Colors.light.blackText,
        marginTop: 10,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: Colors.light.background,
    },
    errorText: {
        fontSize: 16,
        color: Colors.light.error,
        textAlign: 'center',
        marginBottom: 10,
    },
    retryButton: {
        backgroundColor: Colors.light.primaryText,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginTop: 10,
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
    },
    noDataText: {
        fontSize: 16,
        color: Colors.light.blackText,
    },
    header: {
        marginTop: 40,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        color: Colors.light.blackText,
        textAlign: 'left',
    },
    headerSubtitle: {
        fontSize: 16,
        color: Colors.light.primaryText,
        textAlign: 'left',
    },
    packageCard: {
        padding: 2,
        flexDirection: 'row',
        backgroundColor: Colors.light.whiteText,
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.light.primaryText,
        elevation: 2,
    },
    packageInfo: {
        flex: 2,
        padding: 16,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    packageTitle: {
        fontSize: 24,
        color: Colors.light.blackText,
    },
    packageDescription: {
        fontSize: 14,
        color: Colors.light.blackText,
        // marginVertical: 2, // Điều chỉnh khoảng cách giữa các mô tả
    },
    descriptionContainer: {
        marginTop: 10, // Khoảng cách giữa giá và mô tả
        marginBottom: 10,
    },
    packagePrice: {
        fontSize: 18,
        color: Colors.light.primaryText,
        marginTop: 5,
    },
    learnMoreButton: {
        backgroundColor: Colors.light.primaryText,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        justifyContent: 'center',
        marginTop: 10,
    },
    learnMoreText: {
        fontSize: 14,
        color: Colors.light.whiteText,
        textAlign: 'center',
    },
    packageImage: {
        width: 150,
        height: 200,
        borderRadius: 12,
    },
});

export default Promotions;