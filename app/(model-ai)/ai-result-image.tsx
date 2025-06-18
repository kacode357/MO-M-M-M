// app/(model-ai)/ai-result-image.tsx
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import AlertModal from '@/components/AlertModal'; // Import AlertModal của bạn
import { Colors } from '@/constants/Colors';
import { Fonts, getFontMap } from '@/constants/Fonts';
import { useFonts } from 'expo-font';

const { width } = Dimensions.get('window');

const ResultScreen = () => {
    const [fontsLoaded] = useFonts(getFontMap());
    const params = useLocalSearchParams();
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [promptUsed, setPromptUsed] = useState<string>('');
    const [loadingImage, setLoadingImage] = useState(true);
    const [showAlertModal, setShowAlertModal] = useState(false); // Thêm trạng thái để hiển thị modal
    const [alertMessage, setAlertMessage] = useState(''); // Thêm trạng thái để lưu tin nhắn modal
    const [alertTitle, setAlertTitle] = useState(''); // Thêm trạng thái để lưu tiêu đề modal
    const [isSuccessAlert, setIsSuccessAlert] = useState(false); // Thêm trạng thái báo thành công/thất bại

    useEffect(() => {
        if (params.imageUrls) {
            try {
                const parsedUrls = JSON.parse(params.imageUrls as string);
                setImageUrls(parsedUrls);
            } catch (error) {
                console.error("Failed to parse image URLs:", error);
                // Sử dụng AlertModal thay cho Alert thông thường
                setAlertTitle('Lỗi');
                setAlertMessage('Không thể tải ảnh. Vui lòng thử lại.');
                setIsSuccessAlert(false);
                setShowAlertModal(true);
            }
        }
        if (params.prompt) {
            setPromptUsed(params.prompt as string);
        }
    }, [params.imageUrls, params.prompt]);

    const downloadImage = async (uri: string, index: number) => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            setAlertTitle("Lỗi");
            setAlertMessage("Ứng dụng cần quyền truy cập thư viện ảnh để tải ảnh xuống.");
            setIsSuccessAlert(false);
            setShowAlertModal(true);
            return;
        }

        const filename = `logo_ai_${Date.now()}_${index}.jpeg`;
        const localUri = FileSystem.cacheDirectory + filename;

        try {
            const { uri: downloadedUri } = await FileSystem.downloadAsync(uri, localUri);
            await MediaLibrary.saveToLibraryAsync(downloadedUri);

            setAlertTitle("Thành công");
            setAlertMessage("Ảnh đã được tải xuống và lưu vào thư viện ảnh của bạn!");
            setIsSuccessAlert(true);
            setShowAlertModal(true);
        } catch (error) {
            console.error('Lỗi khi tải ảnh:', error);
            setAlertTitle('Lỗi');
            setAlertMessage(`Không thể tải ảnh. Vui lòng thử lại.\nLỗi: ${(error as Error).message}`);
            setIsSuccessAlert(false);
            setShowAlertModal(true);
        }
    };

    if (!fontsLoaded) {
        return <View style={styles.loadingContainer}><Text>Đang tải font...</Text></View>;
    }

    if (imageUrls.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialIcons name="arrow-back-ios" size={24} color={Colors.light.blackText} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { fontFamily: Fonts.Baloo2.Bold }]}>Kết quả tạo Logo</Text>
                    <View style={styles.backButtonPlaceholder} />
                </View>
                <View style={styles.noImagesContainer}>
                    <Text style={[styles.noImagesText, { fontFamily: Fonts.Comfortaa.Regular }]}>Không có ảnh nào được tạo.</Text>
                    <TouchableOpacity style={styles.backToCreateButton} onPress={() => router.back()}>
                        <Text style={[styles.backToCreateButtonText, { fontFamily: Fonts.Baloo2.Bold }]}>Quay lại tạo logo</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialIcons name="arrow-back-ios" size={24} color={Colors.light.blackText} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { fontFamily: Fonts.Baloo2.Bold }]}>Kết quả tạo Logo</Text>
                    <View style={styles.backButtonPlaceholder} />
                </View>

                {promptUsed ? (
                    <View style={styles.promptContainer}>
                        <Text style={[styles.promptTitle, { fontFamily: Fonts.Comfortaa.Medium }]}>Câu lệnh đã dùng:</Text>
                        <Text style={[styles.promptText, { fontFamily: Fonts.Comfortaa.Regular }]}>{promptUsed}</Text>
                    </View>
                ) : null}

                {imageUrls.map((url, index) => (
                    <View key={index} style={styles.imageWrapper}>
                        <View style={styles.imageContainer}>
                            {loadingImage && (
                                <ActivityIndicator
                                    style={styles.activityIndicator}
                                    size="large"
                                    color={Colors.light.primaryText}
                                />
                            )}
                            <Image
                                source={{ uri: url }}
                                style={styles.image}
                                resizeMode="contain"
                                onLoadStart={() => setLoadingImage(true)}
                                onLoadEnd={() => setLoadingImage(false)}
                                onError={(e) => {
                                    console.error("Error loading image:", e.nativeEvent.error);
                                    setAlertTitle("Lỗi");
                                    setAlertMessage("Không thể tải ảnh. Vui lòng kiểm tra URL.");
                                    setIsSuccessAlert(false);
                                    setShowAlertModal(true);
                                    setLoadingImage(false);
                                }}
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.downloadButton}
                            onPress={() => downloadImage(url, index)}
                        >
                            <MaterialIcons name="file-download" size={24} color={Colors.light.whiteText} />
                            <Text style={[styles.downloadButtonText, { fontFamily: Fonts.Baloo2.Bold }]}>Tải về</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity style={styles.backToCreateButton} onPress={() => router.back()}>
                    <Text style={[styles.backToCreateButtonText, { fontFamily: Fonts.Baloo2.Bold }]}>Tạo logo khác</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Alert Modal */}
            <AlertModal
                visible={showAlertModal}
                title={alertTitle}
                message={alertMessage}
                isSuccess={isSuccessAlert}
                onConfirm={() => setShowAlertModal(false)} // Khi nhấn OK, đóng modal
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollViewContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
        flexGrow: 1,
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 40,
        marginBottom: 20,
        width: '100%',
    },
    backButton: {
        padding: 5,
    },
    backButtonPlaceholder: {
        width: 24,
        height: 16,
    },
    headerTitle: {
        fontSize: 24,
        color: Colors.light.blackText,
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    promptContainer: {
        width: '100%',
        backgroundColor: Colors.light.whiteText,
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.light.primaryText,
        shadowColor: Colors.light.blackText,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    promptTitle: {
        fontSize: 16,
        color: Colors.light.blackText,
        marginBottom: 5,
    },
    promptText: {
        fontSize: 14,
        color: Colors.light.blackText,
        lineHeight: 20,
    },
    imageWrapper: {
        marginBottom: 20,
        alignItems: 'center',
        width: '100%',
    },
    imageContainer: {
        width: width * 0.9,
        height: width * 0.9,
        backgroundColor: Colors.light.grayBackground,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.light.primaryText,
        marginBottom: 15,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    activityIndicator: {
        position: 'absolute',
        zIndex: 1,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.tabBackground,
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
        shadowColor: Colors.light.blackText,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 8,
    },
    downloadButtonText: {
        fontSize: 16,
        color: Colors.light.whiteText,
        marginLeft: 8,
    },
    noImagesContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    noImagesText: {
        fontSize: 18,
        color: Colors.light.blackText,
        textAlign: 'center',
        marginBottom: 20,
    },
    backToCreateButton: {
        backgroundColor: Colors.light.tabBackground,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: Colors.light.blackText,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 8,
    },
    backToCreateButtonText: {
        fontSize: 18,
        color: Colors.light.whiteText,
    },
});

export default ResultScreen;