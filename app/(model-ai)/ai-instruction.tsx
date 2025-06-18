// app/(ai)/ai-instruction.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/Colors';
import { Fonts, getFontMap } from '@/constants/Fonts';
import { useFonts } from 'expo-font';

const AiInstructionScreen = () => {
    const [fontsLoaded] = useFonts(getFontMap());

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Đang tải font...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialIcons name="arrow-back-ios" size={24} color={Colors.light.blackText} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { fontFamily: Fonts.Baloo2.Bold }]}>HƯỚNG DẪN NHẬP CÂU LỆNH</Text>
                    {/* Placeholder để căn giữa tiêu đề */}
                    <View style={styles.backButtonPlaceholder} />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { fontFamily: Fonts.Baloo2.Bold }]}>
                        1 câu lệnh chuẩn trong Măm Map sẽ có:
                    </Text>
                    <View style={styles.instructionBox}>
                        <Text style={[styles.instructionItem, { fontFamily: Fonts.Comfortaa.Regular }]}>
                            • Con vật/món ăn (ví dụ: con mèo,...)
                        </Text>
                        <Text style={[styles.instructionItem, { fontFamily: Fonts.Comfortaa.Regular }]}>
                            • Đặc điểm (ví dụ: dễ thương,...)
                        </Text>
                        <Text style={[styles.instructionItem, { fontFamily: Fonts.Comfortaa.Regular }]}>
                            • Yếu tố phụ (nhập 1-4 yếu tố) (ví dụ: đội nón đầu bếp, có hai nước,...)
                        </Text>
                        <Text style={[styles.instructionItem, { fontFamily: Fonts.Comfortaa.Regular }]}>
                            • Tâm trạng (ví dụ: vui vẻ,...)
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { fontFamily: Fonts.Baloo2.Bold }]}>Ví dụ:</Text>
                    <View style={styles.exampleBox}>
                        <Text style={[styles.exampleText, { fontFamily: Fonts.Comfortaa.Regular }]}>
                            Con mèo dễ thương, nháy mắt, đội nón đầu bếp, có cây cán bột, hai nước nhẹ
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { fontFamily: Fonts.Baloo2.Bold }]}>Sau đó chọn:</Text>
                    <View style={styles.selectedOptionsExample}>
                        <TouchableOpacity style={styles.exampleOptionButton}>
                            <Text style={[styles.exampleOptionText, { fontFamily: Fonts.Comfortaa.Regular }]}>Dễ thương</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.exampleOptionButton}>
                            <Text style={[styles.exampleOptionText, { fontFamily: Fonts.Comfortaa.Regular }]}>Hiện đại</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.exampleOptionButton}>
                            <Text style={[styles.exampleOptionText, { fontFamily: Fonts.Comfortaa.Regular }]}>Hình tròn</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.exampleColors}>
                        <View style={[styles.exampleColorSwatch, { backgroundColor: '#FF8C00' }]} />
                        <View style={[styles.exampleColorSwatch, { backgroundColor: '#00CED1' }]} />
                        <View style={[styles.exampleColorSwatch, { backgroundColor: '#FFFFFF', borderColor: Colors.light.blackText, borderWidth: 1 }]} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { fontFamily: Fonts.Baloo2.Bold }]}>Kết quả:</Text>
                
                    <View style={styles.resultImageContainer}>
                       
                         <Image
                            source={require('@/assets/images/result-logo-demo.png')} //
                            style={styles.resultImage}
                            resizeMode="contain"
                        />
                    </View>
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
        paddingBottom: 30,
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
        marginTop: 45, // Đã chỉnh margin top 40
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    backButtonPlaceholder: {
        width: 24, // Chiều rộng bằng icon arrow-forward để căn giữa tiêu đề
        height: 24, // Chiều cao bằng icon arrow-forward
    },
    headerTitle: {
        fontSize: 20, // Kích thước tiêu đề nhỏ hơn một chút cho màn hình hướng dẫn
        color: Colors.light.primaryText, // Màu cam cho tiêu đề hướng dẫn
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        color: Colors.light.blackText,
        marginBottom: 10,
    },
    instructionBox: {
        backgroundColor: Colors.light.whiteText,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.light.primaryText, // Viền cam
        padding: 15,
        shadowColor: Colors.light.blackText,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    instructionItem: {
        fontSize: 15,
        color: Colors.light.blackText,
        marginBottom: 5,
        lineHeight: 22,
    },
    exampleBox: {
        backgroundColor: Colors.light.whiteText,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.light.primaryText,
        padding: 15,
        shadowColor: Colors.light.blackText,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    exampleText: {
        fontSize: 15,
        color: Colors.light.blackText,
        lineHeight: 22,
    },
    selectedOptionsExample: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 10,
        justifyContent: 'flex-start', // Căn trái
    },
    exampleOptionButton: {
        borderWidth: 1,
        borderColor: Colors.light.primaryText,
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: Colors.light.primaryText, // Nền cam
    },
    exampleOptionText: {
        fontSize: 14,
        color: Colors.light.whiteText, // Chữ trắng
    },
    exampleColors: {
        flexDirection: 'row',
        justifyContent: 'center', // Căn giữa
        gap: 8,
        marginTop: 10,
    },
    exampleColorSwatch: {
        width: 30,
        height: 30,
        borderRadius: 15, // Hình tròn
        borderWidth: 1,
        borderColor: Colors.light.grayBackground,
    },
    resultImageContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 10,
    },
    resultImage: {
        width: 200, // Chiều rộng ảnh ví dụ
        height: 200, // Chiều cao ảnh ví dụ
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.light.grayBackground,
    }
});

export default AiInstructionScreen;