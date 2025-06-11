import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const BasicPackageDetails = () => {
  return (
    <View style={styles.container}>
      {/* Top section with header and subtitle */}
      <View style={styles.topSection}>
        <View style={styles.header}>
          <Text style={styles.title}>Gói Cơ Bản</Text>
          <MaterialIcons
            name="close"
            size={34}
            color="#000000"
            onPress={() => router.back()}
          />
        </View>
        <Text style={styles.subtitle}>
          Van sử khó đầu nan, gian nan không thể nan với Gói Cơ Bản của Măm Map
        </Text>
      </View>
      {/* Centered card section */}
      <View style={styles.cardWrapper}>
        <View style={styles.cardContainer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>39.000</Text>
            <Text style={styles.currency}>VND</Text>
            <Text style={styles.duration}>/tháng</Text>
          </View>
          <View style={styles.featureContainer}>
            <View style={styles.featureRow}>
              <MaterialIcons name="check" size={20} color="#000000" />
              <Text style={styles.feature}>Tạo logo với AI (3 lần/1 tháng)</Text>
            </View>
            <View style={styles.featureRow}>
              <MaterialIcons name="check" size={20} color="#000000" />
              <Text style={styles.feature}>Cho phép quán trả lời review</Text>
            </View>
            
          </View>
          <Text style={styles.upgradeButton}>Nâng cấp ngay</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
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
    fontFamily: Fonts.Baloo2.ExtraBold,
    fontSize: 32,
    color: '#000000',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.Comfortaa.Regular,
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
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderColor: Colors.light.primaryText,
    borderWidth: 1,
    alignItems: 'center',
    width: '85%', // Reduced width to 80% for a more compact appearance
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  price: {
    fontFamily: Fonts.Baloo2.ExtraBold,
    fontSize: 32,
    color: '#000000',
  },
  currency: {
    fontFamily: Fonts.Baloo2.Bold,
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
    marginLeft: 4,
  },
  duration: {
    fontFamily: Fonts.Comfortaa.Medium,
    fontSize: 14,
    color: '#000000',
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
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
    color: '#000000',
    marginLeft: 8,
  },
  upgradeButton: {
    fontFamily: Fonts.Baloo2.Bold,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: Colors.light.primaryText,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    textAlign: 'center',
    width: '100%',
  },
});

export default BasicPackageDetails;