import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '@env';
import axios from 'axios';

const GradingScreen = () => {
  const { examId, examTitle, courseCode, courseName, examDate, examTime } = useLocalSearchParams();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [studentId, setStudentId] = useState('');
  const { tokens, user } = useAuth(); // assumes user object has id & role info

  const pickFromCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImages(prev => [...prev, result.assets[0]]);
    }
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      Alert.alert('Missing Images', 'Please scan at least one image.');
      return;
    }

    if (!studentId) {
      Alert.alert('Missing Student ID', 'Please enter a valid student ID.');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    images.forEach((img, idx) => {
      formData.append('images', {
        uri: img.uri,
        name: `page_${idx + 1}.jpg`,
        type: 'image/jpeg',
      });
    });

    formData.append('exam_id', examId);
    formData.append('student_id', studentId);
    formData.append('invigilator_id', user?.id);

    try {
      const response = await axios.post(`${API_URL}/create-student-answer-pdf/`, formData, {
        headers: {
          Authorization: `Bearer ${tokens.access}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success ✅', 'Images uploaded and PDF created!');
      setImages([]);
      setStudentId('');
    } catch (err) {
      console.error('Upload error:', err.response?.data || err.message);
      Alert.alert('Error ❌', 'Upload failed. Check server or fields.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Grading: {examTitle}</Text>
      <Text style={styles.subTitle}>{courseCode} - {courseName}</Text>
      <Text style={styles.detail}>Date: {examDate} | Time: {examTime}</Text>

      <TextInput
        placeholder="Enter Student ID"
        value={studentId}
        onChangeText={setStudentId}
        style={styles.input}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.scanButton} onPress={pickFromCamera}>
        <Text style={styles.scanButtonText}>📷 Scan Answer Sheet</Text>
      </TouchableOpacity>

      {images.length > 0 && (
        <>
          <Text style={styles.previewLabel}>Scanned Pages:</Text>
          <FlatList
            data={images}
            keyExtractor={(_, idx) => idx.toString()}
            horizontal
            renderItem={({ item }) => (
              <Image source={{ uri: item.uri }} style={styles.previewImage} />
            )}
          />

          <TouchableOpacity
            style={[styles.uploadButton, uploading && { backgroundColor: '#999' }]}
            onPress={handleUpload}
            disabled={uploading}
          >
            <Text style={styles.uploadButtonText}>
              {uploading ? 'Uploading...' : '✅ Done Scanning - Submit'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 18,
    color: '#495057',
    marginBottom: 2,
  },
  detail: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  scanButton: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#212529',
  },
  previewImage: {
    width: 120,
    height: 160,
    marginRight: 10,
    borderRadius: 8,
  },
  uploadButton: {
    backgroundColor: 'green',
    padding: 14,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GradingScreen;
