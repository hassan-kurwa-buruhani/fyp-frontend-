import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router'; // ✅ Import params

export default function ScanAnswerSheets() {
  // Get all params from the route query
  const params = useLocalSearchParams();

  // Extract values
  const examId = params.id;
  const examName = params.name;
  const course = params.course;
  const courseName = params.course_name;

  const [images, setImages] = useState([]);
  const [cameraOpen, setCameraOpen] = useState(false);

  const requestCameraPermission = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission Denied', 'Camera access is required');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const photoUri = result.assets[0].uri;
      setImages((prev) => [...prev, photoUri]);
    }
  };

  const handleOpenCamera = () => {
    setCameraOpen(true);
    takePhoto();
  };

  const handleAddAnother = () => {
    takePhoto();
  };

  const handleDone = () => {
    setCameraOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Answer Sheets</Text>
      <Text style={styles.examIdText}>Exam ID: {examId}</Text>
      <Text style={styles.examIdText}>Exam Title: {examName}</Text>
      <Text style={styles.examIdText}>Course: {course}</Text>
      <Text style={styles.examIdText}>Course Name: {courseName}</Text>


      {!cameraOpen && (
        <Button title="📷 Open Camera" onPress={handleOpenCamera} />
      )}

      {cameraOpen && (
        <View style={styles.cameraButtons}>
          <Button title="➕ Take Another Photo" onPress={handleAddAnother} />
          <View style={{ height: 10 }} />
          <Button title="✅ Done" onPress={handleDone} />
        </View>
      )}

      {images.length > 0 && (
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Review Captured Sheets:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={styles.thumbnail}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  examIdText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 20,
    color: '#333',
  },
  cameraButtons: { marginVertical: 20 },
  reviewSection: { marginTop: 30 },
  reviewTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  thumbnail: {
    width: 120,
    height: 160,
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});
