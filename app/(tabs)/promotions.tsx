import { Colors } from '@/constants/Colors';
import { Fonts, getFontMap } from '@/constants/Fonts';
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { hasPackage } from '@/services/payment.services';
import { searchPremiumPackage } from '@/services/premiumPackage.services';

interface PremiumPackage {
    id: number;
    name: string;
    price: number;
    descriptions: string[];
    status: boolean;
    createdAt: string;
    updatedAt: string;
}

interface PurchasedPackage {
    userId: string;
    premiumPackageId: number;
    purchaseDate: string;
    isActive: boolean;
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
            const [premiumPackagesResponse, purchasedPackagesResponse] = await Promise.all([
                searchPremiumPackage({
                    pageNum: 1,
                    pageSize: 10,
                    searchKeyword: '',
                    status: true,
                }),
                hasPackage(),
            ]);

            const rawPackages = premiumPackagesResponse.data.pageData;
            setPackages(rawPackages);

            const userPurchasedPackages = purchasedPackagesResponse.data;
            setPurchasedPackages(userPurchasedPackages);

        } catch (err) {
            console.error("Lỗi khi tìm kiếm gói dịch vụ hoặc kiểm tra gói đã mua:", err);
            setError("Không thể tải các gói dịch vụ hoặc kiểm tra trạng thái gói. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPremiumPackages();
    }, [fetchPremiumPackages]);

    const handleLearnMore = (packageType: string, packageId: number) => {
        if (packageType.includes('Cơ Bản')) {
            router.push('/(model-ai)/ai-create-image'); // Chuyển hướng đến trang tạo ảnh AI
        } else if (packageType.includes('Tiêu Chuẩn')) {
            router.push({
                pathname: '/(promotion)/standard-package',
                params: { id: packageId.toString() }
            });
        }
        // Thêm các điều kiện khác nếu có thêm gói dịch vụ
    };

    // Hàm kiểm tra xem gói đã được mua và kích hoạt chưa
    const isPackageActive = (packageId: number) => {
        return purchasedPackages.some(
            (pkg) => pkg.premiumPackageId === packageId && pkg.isActive
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
                <Text style={[styles.noDataText, { fontFamily: Fonts.Comfortaa.Regular }]}>Hiện chưa có gói dịch vụ nào.</Text>
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
                return (
                    <View key={pkg.id} style={styles.packageCard}>
                        <View style={styles.packageInfo}>
                            <Text style={[styles.packageTitle, { fontFamily: Fonts.Baloo2.Bold }]}>{pkg.name}</Text>
                            <Text style={[styles.packagePrice, { fontFamily: Fonts.Baloo2.Bold }]}>
                                Giá: {pkg.price.toLocaleString('vi-VN')} VNĐ
                            </Text>
                            <TouchableOpacity
                                style={styles.learnMoreButton}
                                onPress={() => handleLearnMore(pkg.name, pkg.id)}
                            >
                                <Text style={[styles.learnMoreText, { fontFamily: Fonts.Comfortaa.Medium }]}>
                                    {isActivePackage ? 'Sử dụng ngay' : 'Tìm hiểu thêm'}
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
        marginVertical: 10,
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