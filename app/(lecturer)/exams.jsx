import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Exams() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exams</Text>
      <Text>Here you can manage your exams.</Text>
      {/* Add your exam list or controls here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
});
