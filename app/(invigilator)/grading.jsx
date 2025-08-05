import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  FlatList, Alert, ScrollView, TextInput, ActivityIndicator,
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
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(true);
  const { tokens, user } = useAuth();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${API_URL}/exams/${examId}/`, {
          headers: {
            Authorization: `Bearer ${tokens.access}`,
          },
        });

        setStudents(response.data.students_pending_submission || []);
      } catch (error) {
        console.error('Failed to fetch students:', error.response?.data || error.message);
        Alert.alert('Error', 'Failed to fetch student list');
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [examId, tokens.access]);

  const pickFromCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed.');
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
    if (!selectedStudent) {
      Alert.alert('Student Missing', 'Select a student before submitting.');
      return;
    }

    if (images.length === 0) {
      Alert.alert('No Images', 'Please scan at least one page.');
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
    formData.append('student_registration_number', selectedStudent);
    formData.append('invigilator_id', user?.id);

    try {
      const response = await axios.post(`${API_URL}/create-student-answer-pdf/`, formData, {
        headers: {
          Authorization: `Bearer ${tokens.access}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('✅ Success', 'PDF created and uploaded!');
      setImages([]);
      setSelectedStudent('');
    } catch (err) {
      console.error('Upload failed:', err.response?.data || err.message);
      Alert.alert('❌ Upload Failed', 'Check fields or server.');
    } finally {
      setUploading(false);
    }
  };

  const filteredStudents = students.filter(reg =>
    reg.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Grading: {examTitle}</Text>
      <Text style={styles.subTitle}>{courseCode} - {courseName}</Text>
      <Text style={styles.detail}>Date: {examDate} | Time: {examTime}</Text>

      <Text style={styles.label}>🎓 Select Student (by Reg Number)</Text>
      <TextInput
        placeholder="Search Student Reg Number"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.input}
      />

      {loadingStudents ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : students.length === 0 ? (
        <Text style={styles.emptyMessage}>🎉 All students answers have been submitted.</Text>
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item, idx) => idx.toString()}
          style={styles.studentList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.studentItem,
                selectedStudent === item && { backgroundColor: '#007bff' },
              ]}
              onPress={() => setSelectedStudent(item)}
            >
              <Text
                style={[
                  styles.studentText,
                  selectedStudent === item && { color: '#fff' },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {students.length > 0 && (
        <TouchableOpacity style={styles.scanButton} onPress={pickFromCamera}>
          <Text style={styles.scanButtonText}>📷 Scan Answer Sheet</Text>
        </TouchableOpacity>
      )}

      {images.length > 0 && (
        <>
          <Text style={styles.previewLabel}>📄 Scanned Pages:</Text>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#212529',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  studentList: {
    maxHeight: 180,
    marginBottom: 20,
  },
  studentItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    backgroundColor: '#e9ecef',
  },
  studentText: {
    fontSize: 15,
    color: '#212529',
  },
  emptyMessage: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#28a745',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
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
