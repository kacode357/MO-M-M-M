// src/styles/FlavorStyles.ts
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
  title: {
    fontFamily: Fonts.Baloo2.Bold,
    fontSize: 24,
    color: Colors.light.text,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 10,
  },
  listContainer: {
    paddingBottom: 15,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.icon,
  },
  itemSelected: {
    backgroundColor: Colors.light.primaryText,
    paddingHorizontal: 5,
    borderRadius: 4,
  },
  itemText: {
    fontFamily: Fonts.Comfortaa.Medium,
    fontSize: 16,
    color: Colors.light.text,
  },
  itemTextSelected: {
    color: Colors.light.whiteText,
  },
  confirmButton: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.light.primaryText,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    fontFamily: Fonts.Comfortaa.Medium,
    fontWeight: '500',
    fontSize: 16,
    color: Colors.light.whiteText,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 10,
    fontFamily: Fonts.Comfortaa.Medium,
    fontSize: 16,
    color: Colors.light.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    paddingHorizontal: 20,
  },
  errorText: {
    fontFamily: Fonts.Comfortaa.Medium,
    fontSize: 16,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    width: '50%',
    height: 50,
    backgroundColor: Colors.light.primaryText,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    fontFamily: Fonts.Comfortaa.Medium,
    fontWeight: '500',
    fontSize: 16,
    color: Colors.light.whiteText,
  },
});