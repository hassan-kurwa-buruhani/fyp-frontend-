// utils/toastConfig.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  successContainer: {
    backgroundColor: '#4BB543',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorContainer: {
    backgroundColor: '#FF3333',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoContainer: {
    backgroundColor: '#1A237E', // Using your theme color
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  }
});

export const toastConfig = {
  success: ({ text1, props }) => (
    <View style={styles.successContainer}>
      <MaterialIcons name="check-circle" size={24} color="white" />
      <Text style={styles.text}>{text1}</Text>
    </View>
  ),
  error: ({ text1, props }) => (
    <View style={styles.errorContainer}>
      <MaterialIcons name="error" size={24} color="white" />
      <Text style={styles.text}>{text1}</Text>
    </View>
  ),
  info: ({ text1, props }) => (
    <View style={styles.infoContainer}>
      <MaterialIcons name="info" size={24} color="white" />
      <Text style={styles.text}>{text1}</Text>
    </View>
  ),
};