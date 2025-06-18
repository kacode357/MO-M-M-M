// app/(payment)/payment-qr-screen.tsx
import { Colors } from "@/constants/Colors";
import { Fonts, getFontMap } from "@/constants/Fonts";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { useFonts } from "expo-font";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

import { checkPaymentStatus } from "@/services/payment.services";
import { getPremiumPackageById } from "@/services/premiumPackage.services";
import { GetCurrentUserApi } from "@/services/user.services";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PremiumPackage {
    id: string;
    name: string;
    price: number;
    descriptions: string[];
    status: boolean;
    createdAt: string;
    updatedAt: string;
}

interface PaymentStatusResponse {
    paymentId: string;
    paymentStatus: boolean; // true nếu đã thanh toán, false nếu chưa
    message: string;
    // Thêm các trường khác nếu API trả về
}

const PaymentQrScreen = () => {
    const [fontsLoaded] = useFonts(getFontMap());
    const { qrCodeUrl, paymentId, premiumPackageId, paymentCode } = useLocalSearchParams();

    const [packageData, setPackageData] = useState<PremiumPackage | null>(null);
    const [isLoadingPackage, setIsLoadingPackage] = useState(true);
    const [packageError, setPackageError] = useState<string | null>(null);

    const [paymentStatusData, setPaymentStatusData] =
        useState<PaymentStatusResponse | null>(null);
    const [paymentStatusError, setPaymentStatusError] = useState<string | null>(
        null
    );
    const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);

    const intervalRef = useRef<number | null>(null);

    const fetchPackageDetails = useCallback(async (id: string) => {
        setIsLoadingPackage(true);
        setPackageError(null);
        try {
            const response = await getPremiumPackageById(id);
            setPackageData(response.data);
        } catch (err) {
            console.error("Lỗi khi lấy chi tiết gói:", err);
            setPackageError("Không thể tải thông tin gói. Vui lòng thử lại.");
            setPackageData(null);
        } finally {
            setIsLoadingPackage(false);
        }
    }, []);

    const pollPaymentStatus = useCallback(async () => {
        if (typeof paymentId !== "string") {
            setPaymentStatusError(
                "Không tìm thấy ID giao dịch để kiểm tra trạng thái."
            );
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            return;
        }

        try {
            const statusResponse = await checkPaymentStatus(paymentId);
            setPaymentStatusData(statusResponse.data);
            console.log("Trạng thái thanh toán:", statusResponse.data);
            if (statusResponse.data?.paymentStatus) {
                setIsPaymentConfirmed(true);
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                try {
                    const userResponse = await GetCurrentUserApi();
                    console.log(
                        "Thông tin người dùng sau thanh toán:",
                        userResponse.data
                    );
                    const packageNames = userResponse.data.userPackages.map(
                        (item: { packageName: string }) => item.packageName
                    );
                    const jsonValue = JSON.stringify(packageNames);
                    await AsyncStorage.setItem("packageNames", jsonValue);
                    console.log("Đã lưu thành công tên các gói:", packageNames);
                } catch (userError) {
                    console.error(
                        "Lỗi khi lấy thông tin người dùng sau thanh toán:",
                        userError
                    );
                }
            }
        } catch (err) {
            console.error("Lỗi khi kiểm tra trạng thái thanh toán:", err);
            setPaymentStatusError(
                "Lỗi khi kiểm tra trạng thái. Vui lòng thử lại sau."
            );
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
    }, [paymentId]);

    const handleCopyPaymentCode = useCallback(async (code: string) => {
        await Clipboard.setStringAsync(code);
        if (Platform.OS === 'android') {
            ToastAndroid.show('Đã sao chép mã giao dịch!', ToastAndroid.SHORT);
        } else {
            Alert.alert('Sao chép thành công', 'Mã giao dịch đã được sao chép vào bộ nhớ tạm.');
        }
    }, []);

    useEffect(() => {
        if (premiumPackageId && typeof premiumPackageId === "string") {
            fetchPackageDetails(premiumPackageId);
        } else {
            setIsLoadingPackage(false);
            setPackageError("Không tìm thấy ID gói dịch vụ.");
        }
    }, [premiumPackageId, fetchPackageDetails]);

    useEffect(() => {
        if (paymentId && typeof paymentId === "string" && !isPaymentConfirmed) {
            pollPaymentStatus();
            if (intervalRef.current === null) {
                intervalRef.current = setInterval(pollPaymentStatus, 3000);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [paymentId, isPaymentConfirmed, pollPaymentStatus]);

    if (!fontsLoaded || isLoadingPackage) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primaryText} />
                <Text
                    style={[styles.loadingText, { fontFamily: Fonts.Comfortaa.Regular }]}
                >
                    Đang tải thông tin...
                </Text>
            </View>
        );
    }

    if (packageError) {
        return (
            <View style={styles.errorContainer}>
                <Text
                    style={[styles.errorText, { fontFamily: Fonts.Comfortaa.Regular }]}
                >
                    {packageError}
                </Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => {
                        if (typeof premiumPackageId === "string") {
                            fetchPackageDetails(premiumPackageId);
                        } else {
                            router.back();
                        }
                    }}
                >
                    <Text
                        style={[
                            styles.retryButtonText,
                            { fontFamily: Fonts.Comfortaa.Medium },
                        ]}
                    >
                        Thử lại
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!qrCodeUrl || typeof qrCodeUrl !== "string" || !packageData || !paymentCode || typeof paymentCode !== "string") {
        return (
            <View style={styles.errorContainer}>
                <Text
                    style={[styles.errorText, { fontFamily: Fonts.Comfortaa.Regular }]}
                >
                    Không tìm thấy URL mã QR, thông tin gói hoặc mã giao dịch.
                </Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => router.back()}
                >
                    <Text
                        style={[
                            styles.retryButtonText,
                            { fontFamily: Fonts.Comfortaa.Medium },
                        ]}
                    >
                        Quay lại
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    let statusText = "Đang chờ thanh toán...";
    let statusColor = Colors.light.primaryText;
    let statusIcon: "hourglass-empty" | "check-circle" | "error" =
        "hourglass-empty";

    if (paymentStatusData) {
        if (paymentStatusData.paymentStatus) {
            statusText = paymentStatusData.message || "Thanh toán thành công!";
            statusColor = Colors.light.success;
            statusIcon = "check-circle";
        } else {
            statusText = paymentStatusData.message || "Chờ thanh toán...";
            statusColor = Colors.light.primaryText;
            statusIcon = "hourglass-empty";
        }
    }
    if (paymentStatusError) {
        statusText = paymentStatusError;
        statusColor = Colors.light.error;
        statusIcon = "error";
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <MaterialIcons
                            name="arrow-back-ios"
                            size={24}
                            color={Colors.light.blackText}
                        />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { fontFamily: Fonts.Baloo2.Bold }]}>
                        Thanh Toán Gói
                    </Text>
                </View>

                <View style={styles.mainContentCard}>

                    <Text
                        style={[styles.packageName, { fontFamily: Fonts.Baloo2.ExtraBold }]}
                    >
                        {packageData.name}
                    </Text>
                    <View style={styles.priceContainer}>
                        <Text
                            style={[
                                styles.packagePrice,
                                { fontFamily: Fonts.Baloo2.ExtraBold },
                            ]}
                        >
                            {packageData.price.toLocaleString("vi-VN")}
                        </Text>
                        <Text style={[styles.currency, { fontFamily: Fonts.Baloo2.Bold }]}>
                            VND
                        </Text>
                        <Text
                            style={[styles.duration, { fontFamily: Fonts.Comfortaa.Medium }]}
                        >
                            /tháng
                        </Text>
                    </View>
                    <View style={styles.featureContainer}>
                        {packageData.descriptions &&
                            packageData.descriptions.map((desc, index) => (
                                <View key={index} style={styles.featureRow}>
                                    <MaterialIcons
                                        name="check-circle"
                                        size={20}
                                        color={Colors.light.primaryText}
                                    />
                                    <Text
                                        style={[
                                            styles.featureText,
                                            { fontFamily: Fonts.Comfortaa.Regular },
                                        ]}
                                    >
                                        {desc}
                                    </Text>
                                </View>
                            ))}
                    </View>


                    <View style={styles.qrCodeSection}>
                        <Text
                            style={[
                                styles.instructionText,
                                { fontFamily: Fonts.Comfortaa.Regular },
                            ]}
                        >
                            Quét mã QR để hoàn tất thanh toán
                        </Text>
                        <View style={styles.qrCodeContainer}>
                            <Image source={{ uri: qrCodeUrl }} style={styles.qrCodeImage} />
                        </View>


                        {paymentCode && typeof paymentCode === 'string' && (
                            <View style={styles.paymentCodeDisplayContainer}>
                                <Text style={[styles.paymentCodeLabel, { fontFamily: Fonts.Comfortaa.Medium }]}>
                                    Mã :
                                </Text>
                                <Text style={[styles.paymentCodeText, { fontFamily: Fonts.Comfortaa.Regular }]}>
                                    {paymentCode}
                                </Text>
                                {/* Thêm TouchableOpacity với icon copy vào đây */}
                                <TouchableOpacity onPress={() => handleCopyPaymentCode(paymentCode)} style={styles.copyIcon}>
                                    <MaterialIcons name="content-copy" size={20} color={Colors.light.background} />
                                </TouchableOpacity>
                            </View>
                        )}


                        <View style={styles.statusMessageContainer}>
                            <MaterialIcons name={statusIcon} size={24} color={statusColor} />
                            <Text
                                style={[
                                    styles.statusMessageText,
                                    { fontFamily: Fonts.Comfortaa.Medium, color: statusColor },
                                ]}
                            >
                                {statusText}
                            </Text>
                            {!isPaymentConfirmed && !paymentStatusError && (
                                <ActivityIndicator
                                    size="small"
                                    color={statusColor}
                                    style={styles.statusActivityIndicator}
                                />
                            )}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.doneButton,
                            !isPaymentConfirmed && styles.disabledButton,
                        ]}
                        onPress={() => router.replace("/(tabs)/promotions")}
                        disabled={!isPaymentConfirmed}
                    >
                        <Text
                            style={[styles.doneButtonText, { fontFamily: Fonts.Baloo2.Bold }]}
                        >
                            {isPaymentConfirmed ? "Về Trang Chủ" : "Đang Chờ..."}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.light.background,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: Colors.light.blackText,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: Colors.light.background,
    },
    errorText: {
        fontSize: 16,
        color: Colors.light.error,
        textAlign: "center",
        marginBottom: 10,
    },
    retryButton: {
        backgroundColor: Colors.light.primaryText,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginTop: 15,
    },
    retryButtonText: {
        fontSize: 16,
        color: Colors.light.whiteText,
        textAlign: "center",
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 40,
        marginBottom: 25,
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 26,
        color: Colors.light.blackText,
        flex: 1,
        textAlign: "center",
        marginRight: 35,
    },
    mainContentCard: {
        backgroundColor: Colors.light.whiteText,
        borderRadius: 15,
        padding: 20,
        borderColor: Colors.light.primaryText,
        borderWidth: 1,
        shadowColor: Colors.light.blackText,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 8,
        alignItems: "center",
    },
    packageName: {
        fontSize: 28,
        color: Colors.light.primaryText,
        marginBottom: 10,
        textAlign: "center",
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginBottom: 20,
    },
    packagePrice: {
        fontSize: 36,
        color: Colors.light.blackText,
    },
    currency: {
        fontSize: 18,
        color: Colors.light.blackText,
        marginBottom: 5,
        marginLeft: 5,
    },
    duration: {
        fontSize: 16,
        color: Colors.light.blackText,
        marginBottom: 5,
        marginLeft: 5,
    },
    featureContainer: {
        width: "100%",
        paddingHorizontal: 10,
        marginBottom: 25,
    },
    featureRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    featureText: {
        fontSize: 16,
        color: Colors.light.blackText,
        marginLeft: 10,
    },
    qrCodeSection: {
        alignItems: "center",
        width: "100%",
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.light.grayBackground,
        marginTop: 10,
    },
    instructionText: {
        fontSize: 16,
        color: Colors.light.blackText,
        textAlign: "center",
        marginBottom: 15,
    },
    qrCodeContainer: {
        backgroundColor: Colors.light.whiteText,
        padding: 15,
        borderRadius: 10,
        elevation: 5,
        shadowColor: Colors.light.blackText,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        marginBottom: 15,
    },
    qrCodeImage: {
        width: 220,
        height: 220,
        resizeMode: "contain",
    },
    // Đổi tên từ paymentIdContainer thành paymentCodeDisplayContainer cho rõ ràng
    paymentCodeDisplayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Đã thêm: Căn giữa nội dung
        backgroundColor: Colors.light.grayBackground,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 15,
        marginTop: 5,
    },
    // Đổi tên từ paymentIdLabel thành paymentCodeLabel
    paymentCodeLabel: {
        fontSize: 14,
        color: Colors.light.blackText,
        marginRight: 5,
    },
    // Đổi tên từ paymentIdText thành paymentCodeText
    paymentCodeText: {
        marginTop: 3, // Giảm margin top một chút cho cân đối hơn
        fontSize: 14,
        color: Colors.light.blackText,
        fontWeight: 'bold',
        flexShrink: 1,
    },
    copyIcon: {
        marginLeft: 10,
        padding: 5,
    },
    statusMessageContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    statusMessageText: {
        fontSize: 16,
        marginLeft: 10,
        textAlign: "center",
        flexShrink: 1,
        fontWeight: "bold",
    },
    statusActivityIndicator: {
        marginLeft: 10,
    },
    statusErrorText: {
        fontSize: 14,
        color: Colors.light.error,
        textAlign: "center",
        marginTop: 5,
        marginBottom: 10,
    },
    doneButton: {
        backgroundColor: Colors.light.tabBackground,
        paddingVertical: 14,
        paddingHorizontal: 35,
        borderRadius: 30,
        width: "90%",
        alignItems: "center",
        shadowColor: Colors.light.primaryText,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
        marginTop: 10,
    },
    disabledButton: {
        opacity: 0.6,
    },
    doneButtonText: {
        fontSize: 18,
        color: Colors.light.whiteText,
        fontWeight: "bold",
    },
});

export default PaymentQrScreen;