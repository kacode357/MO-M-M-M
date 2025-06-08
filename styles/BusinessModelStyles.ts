// src/styles/BusinessModelStyles.ts
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.icon,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontFamily: Fonts.Baloo2.Bold,
    fontSize: 24,
    color: Colors.light.text,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  item: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.icon,
  },
  itemText: {
    fontFamily: Fonts.Comfortaa.Medium,
    fontSize: 16,
    color: Colors.light.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: Fonts.Comfortaa.Medium,
    fontSize: 16,
    color: Colors.light.text,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontFamily: Fonts.Comfortaa.Medium,
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
  },
});