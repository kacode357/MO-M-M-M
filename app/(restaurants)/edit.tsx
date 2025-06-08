import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';


const EditRestaurant = () => {
  const { id } = useLocalSearchParams() as { id: string };
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Chỉnh sửa thông tin quán</ThemedText>
        <View style={{ width: 24 }} /> 
      </View>
      <ThemedText style={styles.infoText}>Restaurant ID: {id}</ThemedText>
      <ThemedText style={styles.placeholderText}>
        Đây là màn hình chỉnh sửa thông tin quán. ID quán được truyền qua params là: {id}.
        (Thêm form chỉnh sửa ở đây trong thực tế.)
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontFamily: Fonts.Baloo2.Bold,
    fontSize: 24,
    color: Colors.light.text,
  },
  infoText: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 10,
  },
  placeholderText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 14,
    color: Colors.light.icon,
    lineHeight: 20,
  },
});

export default EditRestaurant;