// app/(promotion)/standard-package.tsx (hoặc basic-package.tsx nếu bạn vẫn dùng tên đó)
import { Colors } from '@/constants/Colors';
import { Fonts, getFontMap } from '@/constants/Fonts';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getPremiumPackageById } from '@/services/premiumPackage.services';

interface PremiumPackage {
    id: string;
    name: string;
    price: number;
    descriptions: string[];
    status: boolean;
    createdAt: string;
    updatedAt: string;
}

const StandardPackageDetails = () => {
    const [fontsLoaded] = useFonts(getFontMap());
    const { id } = useLocalSearchParams();
    const [packageData, setPackageData] = useState<PremiumPackage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPackageDetails = useCallback(async (packageId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getPremiumPackageById(packageId);
            setPackageData(response.data);
        } catch (err) {
            console.error("Lỗi khi lấy chi tiết gói:", err);
            setError("Không thể tải chi tiết gói dịch vụ. Vui lòng thử lại.");
            setPackageData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (id && typeof id === 'string') {
            fetchPackageDetails(id);
        } else {
            setIsLoading(false);
            setError("Không tìm thấy ID gói dịch vụ.");
        }
    }, [id, fetchPackageDetails]);

    // HÀM MỚI: Xử lý khi nhấn nút "Nâng cấp ngay"
    const handleUpgradePress = () => {
        if (packageData) {
            // Chuyển hướng đến màn hình chọn phương thức thanh toán và truyền ID gói
            router.push({
                pathname: '/(payment)/payment-method', // Đường dẫn đến màn hình phương thức thanh toán
                params: {
                    premiumPackageId: packageData.id, // Truyền ID gói premium
                    packageName: packageData.name // Truyền tên gói
                }
            });
        } else {
            // Xử lý trường hợp không có packageData (ví dụ: hiển thị alert hoặc log cảnh báo)
            console.warn("Không có dữ liệu gói để nâng cấp.");
            // Có thể thêm một alert cho người dùng ở đây nếu muốn
            // alert("Không thể tiến hành nâng cấp. Vui lòng thử lại.");
        }
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
                <TouchableOpacity style={styles.retryButton} onPress={() => {
                    if (typeof id === 'string') {
                        fetchPackageDetails(id);
                    } else {
                        router.back();
                    }
                }}>
                    <Text style={[styles.retryButtonText, { fontFamily: Fonts.Comfortaa.Medium }]}>Thử lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!packageData) {
        return (
            <View style={styles.noDataContainer}>
                <Text style={[styles.noDataText, { fontFamily: Fonts.Comfortaa.Regular }]}>Không tìm thấy thông tin gói dịch vụ.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.topSection}>
                <View style={styles.header}>
                    <Text style={[styles.title, { fontFamily: Fonts.Baloo2.ExtraBold }]}>{packageData.name}</Text>
                    <MaterialIcons
                        name="close"
                        size={34}
                        color={Colors.light.blackText}
                        onPress={() => router.back()}
                    />
                </View>
                <Text style={[styles.subtitle, { fontFamily: Fonts.Comfortaa.Regular }]}>
                    Van sử khó đầu nan, gian nan không thể nan với {packageData.name} của Măm Map
                </Text>
            </View>
            <View style={styles.cardWrapper}>
                <View style={styles.cardContainer}>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.price, { fontFamily: Fonts.Baloo2.ExtraBold }]}>{packageData.price.toLocaleString('vi-VN')}</Text>
                        <Text style={[styles.currency, { fontFamily: Fonts.Baloo2.Bold }]}>VND</Text>
                        <Text style={[styles.duration, { fontFamily: Fonts.Comfortaa.Medium }]}>/tháng</Text>
                    </View>
                    <View style={styles.featureContainer}>
                        {packageData.descriptions && packageData.descriptions.map((desc, index) => (
                            <View key={index} style={styles.featureRow}>
                                <MaterialIcons name="check" size={20} color={Colors.light.blackText} />
                                <Text style={[styles.feature, { fontFamily: Fonts.Comfortaa.Regular }]}>{desc}</Text>
                            </View>
                        ))}
                    </View>
                    {/* THAY THẾ TEXT BẰNG TOUCHABLEOPACITY */}
                    <TouchableOpacity
                        style={styles.upgradeButton}
                        onPress={handleUpgradePress} // GỌI HÀM XỬ LÝ KHI NHẤN
                    >
                        <Text style={[styles.upgradeButtonText, { fontFamily: Fonts.Baloo2.Bold }]}>Nâng cấp ngay</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
    retryButtonText: {
        fontSize: 16,
        color: Colors.light.whiteText,
        textAlign: 'center',
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
    topSection: {
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 40,
        marginBottom: 8,
    },
    title: {
        fontSize: 32,
        color: Colors.light.blackText,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: Colors.light.primaryText,
        textAlign: 'left',
        marginBottom: 16,
    },
    cardWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContainer: {
        backgroundColor: Colors.light.whiteText,
        padding: 16,
        borderRadius: 12,
        borderColor: Colors.light.primaryText,
        borderWidth: 1,
        alignItems: 'center',
        width: '85%',
        elevation: 3,
        shadowColor: Colors.light.blackText,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    price: {
        fontSize: 32,
        color: Colors.light.blackText,
    },
    currency: {
        fontSize: 16,
        color: Colors.light.blackText,
        marginBottom: 4,
        marginLeft: 4,
    },
    duration: {
        fontSize: 14,
        color: Colors.light.blackText,
        marginBottom: 4,
        marginLeft: 4,
    },
    featureContainer: {
        width: '100%',
        marginBottom: 16,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    feature: {
        fontSize: 16,
        color: Colors.light.blackText,
        marginLeft: 8,
    },
    // Style cho TouchableOpacity
    upgradeButton: {
        backgroundColor: Colors.light.primaryText,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        width: '100%',
        alignItems: 'center', // Căn giữa text bên trong nút
        marginTop: 10,
    },
    // Style cho Text bên trong TouchableOpacity
    upgradeButtonText: {
        fontSize: 16,
        color: Colors.light.whiteText,
        fontFamily: Fonts.Baloo2.Bold, // Giữ font cho text
        textAlign: 'center',
    }
});

export default StandardPackageDetails;