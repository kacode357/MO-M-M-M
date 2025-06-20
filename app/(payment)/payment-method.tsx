// app/(promotion)/payment-method.tsx
import { Colors } from '@/constants/Colors';
import { Fonts, getFontMap } from '@/constants/Fonts';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Import API service tạo thanh toán
import { createPayment } from '@/services/payment.services';

const PaymentMethodScreen = () => {
    const [fontsLoaded] = useFonts(getFontMap());
    const { premiumPackageId, packageName } = useLocalSearchParams();

    console.log('ID gói Premium:', premiumPackageId);
    console.log('Tên gói Premium:', packageName);

    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    const handlePaymentMethodSelect = useCallback(async (method: string) => {
        if (typeof premiumPackageId !== 'string') {
            setPaymentError("ID gói Premium không hợp lệ.");
            return;
        }

        setIsLoadingPayment(true);
        setPaymentError(null);

        try {
            const paymentIdNumber = parseInt(premiumPackageId, 10);
            if (isNaN(paymentIdNumber)) {
                setPaymentError("ID gói Premium không phải là số hợp lệ.");
                setIsLoadingPayment(false);
                return;
            }

            const response = await createPayment(paymentIdNumber);
            console.log(`Tạo thanh toán qua ${method} thành công:`, response);
            // Kiểm tra và đảm bảo response.data có paymentCode
            if (response.status === 200 && response.data?.qrCodeUrl && response.data?.paymentCode) {
                router.push({
                    pathname: '/(payment)/payment-qr-screen',
                    params: {
                        qrCodeUrl: response.data.qrCodeUrl,
                        paymentId: response.data.id,
                        premiumPackageId: premiumPackageId,
                        paymentCode: response.data.paymentCode, 
                    },
                });
            } else if (response.status === 200) {
             
                alert(`Tạo thanh toán thành công với ID: ${response.data?.paymentId || 'N/A'}`);
                router.replace('/(tabs)/promotions');
            }
            else {
                setPaymentError(response.message || `Không thể tạo thanh toán qua ${method}. Vui lòng thử lại.`);
            }

        } catch (err) {
            console.error(`Lỗi khi tạo thanh toán qua ${method}:`, err);
            setPaymentError(`Có lỗi xảy ra khi thanh toán qua ${method}. Vui lòng thử lại.`);
        } finally {
            setIsLoadingPayment(false);
        }
    }, [premiumPackageId]);

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primaryText} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back-ios" size={24} color={Colors.light.blackText} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { fontFamily: Fonts.Baloo2.Bold }]}>Thanh toán qua</Text>
            </View>

            {paymentError && (
                <Text style={[styles.errorText, { fontFamily: Fonts.Comfortaa.Regular }]}>{paymentError}</Text>
            )}
            {isLoadingPayment && (
                <ActivityIndicator size="small" color={Colors.light.primaryText} style={styles.paymentLoading} />
            )}

            <Text style={[styles.packageInfoText, { fontFamily: Fonts.Comfortaa.Medium }]}>
                Bạn đang thanh toán cho gói: {packageName || 'Đang tải...'}
            </Text>

            {/* VNPay (Thanh Toán Mã QR) - Đưa lên đầu */}
            <TouchableOpacity
                style={[styles.paymentOptionCard, isLoadingPayment && styles.disabledCard]}
                onPress={() => handlePaymentMethodSelect('VNPay')}
                disabled={isLoadingPayment}
            >
                <Image source={require('@/assets/images/vnpay_logo.jpg')} style={styles.paymentMethodLogo} />
                <Text style={[styles.paymentMethodText, { fontFamily: Fonts.Comfortaa.Medium }]}>Thanh Toán Mã QR</Text>
            </TouchableOpacity>

            {/* Momo - Làm mờ và không cho nhấn */}
            <TouchableOpacity
                style={[styles.paymentOptionCard, styles.disabledCard]}
                disabled={true}
            >
                <Image source={require('@/assets/images/momo_logo.png')} style={styles.paymentMethodLogo} />
                <Text style={[styles.paymentMethodText, { fontFamily: Fonts.Comfortaa.Medium }]}>Momo</Text>
            </TouchableOpacity>

            {/* Zalo Pay - Làm mờ và không cho nhấn */}
            <TouchableOpacity
                style={[styles.paymentOptionCard, styles.disabledCard]}
                disabled={true}
            >
                <Image source={require('@/assets/images/zalo_pay.png')} style={styles.paymentMethodLogo} />
                <Text style={[styles.paymentMethodText, { fontFamily: Fonts.Comfortaa.Medium }]}>Zalo Pay</Text>
            </TouchableOpacity>

            {/* Viettel Pay - Làm mờ và không cho nhấn */}
            <TouchableOpacity
                style={[styles.paymentOptionCard, styles.disabledCard]}
                disabled={true}
            >
                <Image source={require('@/assets/images/viettel_pay_logo.jpg')} style={styles.paymentMethodLogo} />
                <Text style={[styles.paymentMethodText, { fontFamily: Fonts.Comfortaa.Medium }]}>Viettel Pay</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 28,
        color: Colors.light.blackText,
        flex: 1,
    },
    packageInfoText: {
        fontSize: 16,
        color: Colors.light.blackText,
        textAlign: 'center',
        marginBottom: 20,
    },
    paymentOptionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.whiteText,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.light.primaryText,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 15,
        elevation: 2,
        shadowColor: Colors.light.blackText,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    paymentMethodLogo: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        marginRight: 15,
    },
    paymentMethodText: {
        fontSize: 18,
        color: Colors.light.blackText,
        flex: 1,
    },
    errorText: {
        fontSize: 14,
        color: Colors.light.error,
        textAlign: 'center',
        marginBottom: 10,
    },
    paymentLoading: {
        marginBottom: 10,
    },
    disabledCard: {
        opacity: 0.5,
        borderColor: Colors.light.grayBackground,
    },
});

export default PaymentMethodScreen;