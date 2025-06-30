import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { Fonts, getFontMap } from "@/constants/Fonts";
import { useFonts } from "expo-font";

const API_KEY = "yNVUdjuAPVFR5mlU5T5UQg==";

const AiCreateImage = () => {
  const [fontsLoaded] = useFonts(getFontMap());
  const [command, setCommand] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const stylesOptions = [
    "Tối giản",
    "Hiện đại",
    "Cổ điển",
    "Công nghệ",
    "Màu nước",
    "Chữ tượng hình",
    "Dễ thương",
    "Trừu tượng",
  ];
  const shapesOptions = [
    "Tròn",
    "Vuông",
    "Tam giác",
    "Ngôi sao",
    "Trái tim",
    "Lục giác",
    "Kim cương",
    "Dòng chảy",
  ];
  const colorGrid = [
    "#FF0000",
    "#FF4500",
    "#FFA500",
    "#FFFF00",
    "#ADFF2F",
    "#00FF00",
    "#00FA9A",
    "#00FFFF",
    "#1E90FF",
    "#0000FF",
    "#800080",
    "#FF69B4",
    "#FFC0CB",
    "#FFFFFF",
    "#D3D3D3",
    "#808080",
    "#000000",
    "#A52A2A",
    "#F4A460",
    "#FFD700",
  ];

  const toggleSelection = (
    list: string[],
    item: string,
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    max: number
  ) => {
    const newList = list.includes(item)
      ? list.filter((i) => i !== item)
      : [...list, item];
    if (newList.length > max) {
      Alert.alert(`Chỉ được chọn tối đa ${max} mục.`);
      return;
    }
    setList(newList);
  };

  const handleCreateLogo = async () => {
    if (!command.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập câu lệnh để tạo logo.");
      return;
    }

    setIsLoading(true);

    let fullPrompt = command.trim();

    if (selectedStyles.length > 0) {
      fullPrompt += `, phong cách: ${selectedStyles.join(", ")}`;
    }
    if (selectedShapes.length > 0) {
      fullPrompt += `, hình dạng: ${selectedShapes.join(", ")}`;
    }
    if (selectedColors.length > 0) {
      const colorNames = selectedColors.map((color) => {
        switch (color.toLowerCase()) {
          case "#ff0000":
            return "đỏ";
          case "#ff4500":
            return "đỏ cam";
          case "#ffa500":
            return "cam";
          case "#ffff00":
            return "vàng";
          case "#adff2f":
            return "xanh chanh";
          case "#00ff00":
            return "xanh lá";
          case "#00fa9a":
            return "xanh bạc hà";
          case "#00ffff":
            return "xanh lam ngọc";
          case "#1e90ff":
            return "xanh dương đậm";
          case "#0000ff":
            return "xanh dương";
          case "#800080":
            return "tím";
          case "#ff69b4":
            return "hồng";
          case "#ffc0cb":
            return "hồng nhạt";
          case "#ffffff":
            return "trắng";
          case "#d3d3d3":
            return "xám nhạt";
          case "#808080":
            return "xám";
          case "#000000":
            return "đen";
          case "#a52a2a":
            return "nâu";
          case "#f4a460":
            return "cam đất";
          case "#ffd700":
            return "vàng kim";
          default:
            return `màu ${color}`;
        }
      });
      fullPrompt += `, màu sắc: ${colorNames.join(", ")}`;
    }

    console.log("Full Prompt:", fullPrompt);

    try {
      const response = await fetch(
        "https://api.thehive.ai/api/v3/stabilityai/sdxl",
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: {
              prompt: fullPrompt,
              negative_prompt:
                "blurry, distorted, ugly, low quality, bad resolution, watermarks",
              image_size: { width: 1024, height: 1024 },
              num_inference_steps: 15,
              guidance_scale: 7.5,
              num_images: 1,
              seed: Math.floor(Math.random() * 100000),
              output_format: "jpeg",
              output_quality: 90,
            },
          }),
        }
      );

      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok && data.output && data.output.length > 0) {
        const imageUrls = data.output.map((img: { url: string }) => img.url);
        router.push({
          pathname: "/(model-ai)/ai-result-image",
          params: {
            imageUrls: JSON.stringify(imageUrls),
            prompt: fullPrompt, // Truyền fullPrompt ở đây
          },
        });
      } else {
        Alert.alert(
          "Lỗi",
          data.error?.message || "Không thể tạo logo. Vui lòng thử lại."
        );
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      Alert.alert(
        "Lỗi",
        "Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewInstructions = () => {
    router.push("/(model-ai)/ai-instruction");
  };

  const renderOptionButton = (
    item: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
    max: number
  ) => (
    <TouchableOpacity
      key={item}
      style={[
        styles.optionButton,
        selected.includes(item) && styles.optionButtonSelected,
      ]}
      onPress={() => toggleSelection(selected, item, setSelected, max)}
      disabled={isLoading}
    >
      <Text
        style={[
          styles.optionText,
          { fontFamily: Fonts.Comfortaa.Regular },
          selected.includes(item) && styles.optionTextSelected,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            disabled={isLoading}
          >
            <MaterialIcons
              name="arrow-back-ios"
              size={24}
              color={Colors.light.blackText}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: Fonts.Baloo2.Bold }]}>
            Tạo Logo Bằng AI
          </Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        {/* Command Input Section */}
        <View style={styles.section}>
          <View style={styles.commandHeader}>
            <Text
              style={[
                styles.sectionTitle,
                { fontFamily: Fonts.Comfortaa.Medium },
              ]}
            >
              Nhập câu lệnh
            </Text>
            <TouchableOpacity
              style={styles.instructionButton}
              onPress={handleViewInstructions}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.instructionButtonText,
                  { fontFamily: Fonts.Comfortaa.Medium },
                ]}
              >
                Hướng dẫn
              </Text>
              <MaterialIcons
                name="arrow-forward"
                size={16}
                color={Colors.light.whiteText}
              />
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.textInput, { fontFamily: Fonts.Comfortaa.Regular }]}
            placeholder="Ví dụ: logo quán ăn vặt với bánh tráng trộn và trà sữa..."
            placeholderTextColor={Colors.light.grayBackground}
            multiline
            numberOfLines={4}
            value={command}
            onChangeText={setCommand}
            editable={!isLoading}
          />
        </View>

        {/* Styles Selection */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { fontFamily: Fonts.Comfortaa.Medium },
            ]}
          >
            Phong cách (tối đa 2)
          </Text>
          <View style={styles.optionsContainer}>
            {stylesOptions.map((item) =>
              renderOptionButton(item, selectedStyles, setSelectedStyles, 2)
            )}
          </View>
        </View>

        {/* Shapes Selection */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { fontFamily: Fonts.Comfortaa.Medium },
            ]}
          >
            Hình dạng (tối đa 2)
          </Text>
          <View style={styles.optionsContainer}>
            {shapesOptions.map((item) =>
              renderOptionButton(item, selectedShapes, setSelectedShapes, 2)
            )}
          </View>
        </View>

        {/* Color Grid */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { fontFamily: Fonts.Comfortaa.Medium },
            ]}
          >
            Màu sắc (tối đa 3)
          </Text>
          <View style={styles.colorGridWrapper}>
            <View style={styles.colorGrid}>
              {colorGrid.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    selectedColors.includes(color) &&
                      styles.colorSwatchSelected,
                  ]}
                  onPress={() =>
                    toggleSelection(selectedColors, color, setSelectedColors, 3)
                  }
                  disabled={isLoading}
                />
              ))}
            </View>
            <View style={styles.selectedColorsContainer}>
              {selectedColors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.selectedColorBox, { backgroundColor: color }]}
                  onPress={() =>
                    toggleSelection(selectedColors, color, setSelectedColors, 3)
                  }
                  disabled={isLoading}
                />
              ))}
              {Array.from({ length: 3 - selectedColors.length }).map(
                (_, idx) => (
                  <View key={`empty-${idx}`} style={styles.emptyColorBox} />
                )
              )}
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isLoading && styles.submitButtonDisabled,
          ]}
          onPress={handleCreateLogo}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.light.whiteText} size="small" />
          ) : (
            <Text
              style={[
                styles.submitButtonText,
                { fontFamily: Fonts.Baloo2.Bold },
              ]}
            >
              Ok, chốt!
            </Text>
          )}
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingBottom: 30,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 40,
    marginBottom: 20,
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
    textAlign: "center",
    marginHorizontal: 10,
  },
  section: {
    marginBottom: 25,
  },
  commandHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    color: Colors.light.blackText,
  },
  instructionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primaryText,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  instructionButtonText: {
    fontSize: 14,
    color: Colors.light.whiteText,
    marginRight: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.light.primaryText,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: "top",
    backgroundColor: Colors.light.whiteText,
    color: Colors.light.blackText,
    fontFamily: Fonts.Comfortaa.Regular,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: Colors.light.primaryText,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: Colors.light.whiteText,
  },
  optionButtonSelected: {
    backgroundColor: Colors.light.primaryText,
  },
  optionText: {
    fontSize: 14,
    color: Colors.light.blackText,
  },
  optionTextSelected: {
    color: Colors.light.whiteText,
  },
  colorGridWrapper: {
    borderWidth: 1,
    borderColor: Colors.light.primaryText,
    borderRadius: 8,
    padding: 10,
    backgroundColor: Colors.light.whiteText,
    alignItems: "center",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
    width: "100%",
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primaryText,
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: Colors.light.blackText,
  },
  selectedColorsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
    minHeight: 40,
    width: "100%",
  },
  selectedColorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.light.primaryText,
  },
  emptyColorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.grayBackground,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: Colors.light.tabBackground,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    shadowColor: Colors.light.blackText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.light.grayBackground,
  },
  submitButtonText: {
    fontSize: 18,
    color: Colors.light.whiteText,
  },
});

export default AiCreateImage;
