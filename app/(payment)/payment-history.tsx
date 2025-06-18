// app/(payment)/payment-history.tsx
import { Colors } from '@/constants/Colors';
import { Fonts, getFontMap } from '@/constants/Fonts';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, SafeAreaView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';

import { createPayment, getPaymentHistory } from '@/services/payment.services'; // Import cả createPayment

// Định nghĩa interface cho mỗi item trong lịch sử giao dịch
interface PaymentHistoryItem {
    id: string; // Đây là paymentId trong hệ thống của bạn
    amount: number;
    paymentStatus: boolean;
    createdAt: string;
    paidAt: string | null;
    paymentCode: string; // Mã giao dịch của bên thứ 3 (ví dụ VNPAY)
    transactionId: string | null;
    premiumPackageName: string;
    // qrCodeUrl: string | null; // KHÔNG CẦN TRƯỜNG NÀY NỮA, SẼ LẤY MỚI QUA API createPayment
    premiumPackageId: number; // Đã chỉnh sửa: Thay đổi từ string sang number
}

const PaymentHistoryScreen = () => {
    const [fontsLoaded] = useFonts(getFontMap());
    const [historyData, setHistoryData] = useState<PaymentHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // State để theo dõi ID của giao dịch đang được xử lý tiếp tục
    const [processingItemId, setProcessingItemId] = useState<string | null>(null);

    const fetchPaymentHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getPaymentHistory();
            console.log("Lịch sử giao dịch:", response);
            if (response.status === 200 && response.data) {
                // Đảm bảo dữ liệu API trả về có premiumPackageId
                const mappedData = response.data.map((item: any) => ({
                    id: item.id,
                    amount: item.amount,
                    paymentStatus: item.paymentStatus,
                    createdAt: item.createdAt,
                    paidAt: item.paidAt,
                    paymentCode: item.paymentCode,
                    transactionId: item.transactionId,
                    premiumPackageName: item.premiumPackageName,
                    premiumPackageId: item.premiumPackageId, // Đảm bảo API trả về hoặc ánh xạ
                }));
                const sortedData = mappedData.sort((a: PaymentHistoryItem, b: PaymentHistoryItem) => {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
                setHistoryData(sortedData);
            } else {
                setError(response.message || "Không thể tải lịch sử giao dịch.");
            }
        } catch (err) {
            console.error("Lỗi khi lấy lịch sử giao dịch:", err);
            setError("Lỗi kết nối hoặc không có dữ liệu. Vui lòng thử lại.");
            setHistoryData([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPaymentHistory();
    }, [fetchPaymentHistory]);

    const handleCopyPaymentCode = useCallback(async (code: string) => {
        await Clipboard.setStringAsync(code);
        if (Platform.OS === 'android') {
            ToastAndroid.show('Đã sao chép mã GD!', ToastAndroid.SHORT);
        } else {
            Alert.alert('Sao chép thành công', 'Mã giao dịch đã được sao chép vào bộ nhớ tạm.');
        }
    }, []);

    /**
     * Hàm handleContinuePayment:
     * - Gọi lại API createPayment để lấy thông tin QR mới nhất.
     * - Sau đó điều hướng đến màn hình QR.
     */
    const handleContinuePayment = useCallback(async (item: PaymentHistoryItem) => {
        // Đã chỉnh sửa: Kiểm tra loại dữ liệu của premiumPackageId là number
        if (!item.premiumPackageId || typeof item.premiumPackageId !== 'number') {
            Alert.alert("Lỗi", "Không tìm thấy ID gói dịch vụ để tiếp tục thanh toán hoặc ID không hợp lệ.");
            return;
        }

        setProcessingItemId(item.id); // Đặt ID của item đang được xử lý
        try {
            // Không cần parseInt nữa vì premiumPackageId đã là number
            const premiumIdNumber = item.premiumPackageId; 
            
            const response = await createPayment(premiumIdNumber);
            console.log("Tạo thanh toán lại thành công:", response);

            if (response.status === 200 && response.data?.qrCodeUrl && response.data?.id && response.data?.paymentCode) {
                router.push({
                    pathname: '/(payment)/payment-qr-screen',
                    params: {
                        qrCodeUrl: response.data.qrCodeUrl,
                        paymentId: response.data.id, // ID của payment mới/cập nhật
                        premiumPackageId: item.premiumPackageId.toString(), // Chuyển đổi về string khi truyền qua params
                        paymentCode: response.data.paymentCode, // Mã GD mới
                    },
                });
            } else {
                Alert.alert("Lỗi", response.message || "Không thể tạo lại thanh toán. Vui lòng thử lại.");
            }
        } catch (err) {
            console.error("Lỗi khi gọi lại API tạo thanh toán:", err);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi tiếp tục thanh toán. Vui lòng thử lại.");
        } finally {
            setProcessingItemId(null); // Xóa ID của item đang được xử lý
        }
    }, []);


    if (!fontsLoaded || isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primaryText} />
                <Text style={[styles.loadingText, { fontFamily: Fonts.Comfortaa.Regular }]}>Đang tải lịch sử...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { fontFamily: Fonts.Comfortaa.Regular }]}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchPaymentHistory}>
                    <Text style={[styles.retryButtonText, { fontFamily: Fonts.Comfortaa.Medium }]}>Thử lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderItem = ({ item }: { item: PaymentHistoryItem }) => {
        const paymentStatusText = item.paymentStatus ? "Thành công" : "Đang chờ";
        const paymentStatusColor = item.paymentStatus ? Colors.light.success : Colors.light.primaryText;

        const paidAtDate = item.paidAt ? new Date(item.paidAt).toLocaleString('vi-VN') : 'N/A';
        const createdAtDate = new Date(item.createdAt).toLocaleString('vi-VN');

        const isItemProcessing = processingItemId === item.id; // Kiểm tra xem item này có đang được xử lý không

        return (
            <View style={styles.historyCard}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.packageText, { fontFamily: Fonts.Baloo2.Bold }]}>
                        {item.premiumPackageName}
                    </Text>
                    <Text style={[styles.amountText, { fontFamily: Fonts.Baloo2.ExtraBold }]}>
                        {item.amount.toLocaleString('vi-VN')} VND
                    </Text>
                </View>
                <View style={styles.cardDetailRow}>
                    <Text style={[styles.detailLabel, { fontFamily: Fonts.Comfortaa.Medium }]}>Mã GD:</Text>
                    <View style={styles.paymentCodeContainer}>
                        <Text style={[styles.detailValue, { fontFamily: Fonts.Comfortaa.Regular }]}>{item.paymentCode}</Text>
                        <TouchableOpacity onPress={() => handleCopyPaymentCode(item.paymentCode)} style={styles.copyIcon}>
                            <MaterialIcons name="content-copy" size={16} color={Colors.light.grayBackground} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.cardDetailRow}>
                    <Text style={[styles.detailLabel, { fontFamily: Fonts.Comfortaa.Medium }]}>Ngày tạo:</Text>
                    <Text style={[styles.detailValue, { fontFamily: Fonts.Comfortaa.Regular }]}>{createdAtDate}</Text>
                </View>
                <View style={styles.cardDetailRow}>
                    <Text style={[styles.detailLabel, { fontFamily: Fonts.Comfortaa.Medium }]}>Thanh toán lúc:</Text>
                    <Text style={[styles.detailValue, { fontFamily: Fonts.Comfortaa.Regular }]}>{paidAtDate}</Text>
                </View>
                <View style={styles.cardDetailRow}>
                    <Text style={[styles.detailLabel, { fontFamily: Fonts.Comfortaa.Medium }]}>Trạng thái:</Text>
                    <Text style={[styles.statusText, { fontFamily: Fonts.Comfortaa.Bold, color: paymentStatusColor }]}>
                        {paymentStatusText}
                    </Text>
                </View>

                {/* NÚT TIẾP TỤC THANH TOÁN - CHỈ HIỂN THỊ KHI paymentStatus là false */}
                {!item.paymentStatus && (
                    <TouchableOpacity
                        style={[styles.continuePaymentButton, isItemProcessing && styles.disabledButton]}
                        onPress={() => handleContinuePayment(item)}
                        disabled={isItemProcessing} // Tắt nút khi đang xử lý
                    >
                        {isItemProcessing ? (
                            <ActivityIndicator size="small" color={Colors.light.whiteText} />
                        ) : (
                            // Đã chỉnh sửa: Chỉ hiển thị chữ "Thanh toán" và bỏ icon
                            <Text style={[styles.continuePaymentButtonText, { fontFamily: Fonts.Comfortaa.Medium }]}>
                                Thanh toán
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back-ios" size={24} color={Colors.light.blackText} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { fontFamily: Fonts.Baloo2.Bold }]}>Lịch Sử Giao Dịch</Text>
            </View>

            {historyData.length === 0 && !isLoading && !error ? (
                <View style={styles.emptyContainer}>
                    <MaterialIcons name="inbox" size={80} color={Colors.light.grayBackground} />
                    <Text style={[styles.emptyText, { fontFamily: Fonts.Comfortaa.Regular }]}>
                        Chưa có giao dịch nào.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={historyData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.flatListContent}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
        paddingHorizontal: 16,
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 26,
        color: Colors.light.blackText,
        flex: 1,
        textAlign: 'center',
        marginRight: 35,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: Colors.light.blackText,
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
    flatListContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    historyCard: {
        backgroundColor: Colors.light.whiteText,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.light.grayBackground,
        padding: 15,
        marginBottom: 10,
        shadowColor: Colors.light.blackText,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.light.grayBackground,
    },
    packageText: {
        fontSize: 18,
        color: Colors.light.blackText,
        flexShrink: 1,
    },
    amountText: {
        fontSize: 20,
        color: Colors.light.primaryText,
        marginLeft: 10,
    },
    cardDetailRow: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    detailLabel: {
        fontSize: 14,
        color: Colors.light.blackText,
        width: 120,
    },
    paymentCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        color: Colors.light.blackText,
    },
    copyIcon: {
        marginLeft: 8,
        padding: 4,
    },
    statusText: {
        fontSize: 14,
    },
    continuePaymentButton: {
        backgroundColor: Colors.light.primaryText,
        alignSelf: 'flex-end',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginTop: 10,
        minWidth: 100,
    },
    continuePaymentButtonText: {
        fontSize: 15,
        color: Colors.light.whiteText,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.light.grayBackground,
        marginTop: 10,
    },
    disabledButton: { // Thêm style cho nút bị vô hiệu hóa
        opacity: 0.6,
    },
});

export default PaymentHistoryScreen;