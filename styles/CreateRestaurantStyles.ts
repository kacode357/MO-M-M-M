// src/styles/CreateRestaurantStyles.ts
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
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  imagePicker: {
    width: '100%',
    height: 150,
    borderWidth: 1,
    borderColor: Colors.light.icon,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: Colors.light.background,
  },
  imagePickerText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
    color: Colors.light.icon,
    marginTop: 10,
  },
  inputLabel: {
    fontFamily: Fonts.Comfortaa.Medium,
    fontWeight: '500',
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: Colors.light.icon,
    borderRadius: 25,
    paddingHorizontal: 15,
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 15,
  },
  selectionButton: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.light.primaryText,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  selectionButtonText: {
    fontFamily: Fonts.Comfortaa.Medium,
    fontWeight: '500',
    fontSize: 16,
    color: Colors.light.whiteText,
  },
  selectedText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 15,
  },
  submitButton: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.light.primaryText,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontFamily: Fonts.Comfortaa.Medium,
    fontWeight: '500',
    fontSize: 16,
    color: Colors.light.whiteText,
  },
});