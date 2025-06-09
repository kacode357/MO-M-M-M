import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';

export default function DataScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<ThemedView />} // Use an empty ThemedView as a placeholder
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title">Đang Phát Triển</ThemedText>
        <ThemedText style={styles.message}>
          Màn hình số liệu đang được phát triển. Vui lòng chờ trong thời gian tới!
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
});