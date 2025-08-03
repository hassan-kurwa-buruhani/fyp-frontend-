import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { API_URL } from '@env';
import { useAuth } from '../../context/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';

export default function Sessions() {
  const [modalVisible, setModalVisible] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [examPaper, setExamPaper] = useState(null);
  const [totalMarks, setTotalMarks] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { user, tokens } = useAuth();
  const baseUrl = API_URL;

  useEffect(() => {
    if (!tokens?.access) return;

    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${baseUrl}/lecturer-course/`, {
          headers: {
            Authorization: `Bearer ${tokens.access}`,
          },
        });
        setCourses(response.data);
      } catch (error) {
        console.error('Failed to load courses:', error);
        alert('Could not fetch courses. Please try again.');
      }
    };

    fetchCourses();
  }, [tokens]);

  const pickExamPaper = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result?.assets && result.assets.length > 0) {
        setExamPaper(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking file:', error);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCreateExam = async () => {
    if (!selectedCourse || !title || !date || !time || !totalMarks) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      // Format time to HH:MM:SS
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}:00`;

      const formData = new FormData();
      formData.append('title', title);
      formData.append('date', date.toISOString().split('T')[0]);
      formData.append('time', formattedTime);
      formData.append('course', selectedCourse.code);
      formData.append('created_by', user.id);
      formData.append('total_marks', totalMarks);

      if (examPaper) {
        const uriParts = examPaper.name.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('exam_paper', {
          uri: examPaper.uri,
          name: examPaper.name,
          type: `application/${fileType}`,
        });
      }

      const response = await axios.post(`${baseUrl}/exams/`, formData, {
        headers: {
          Authorization: `Bearer ${tokens.access}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;
      resetForm();
      router.push({
        pathname: '/(lecturer)/answersheet',
        params: {
          id: data.id,
          name: data.title,
          course: data.course,
          course_name: data.course_name,
          time: data.time,
          marks: data.total_marks
        },
      });
    } catch (error) {
      console.error('Error creating exam:', error.response?.data || error.message);
      alert('Failed to create exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setModalVisible(false);
    setSelectedCourse(null);
    setTitle('');
    setDate(new Date());
    setTime(new Date());
    setExamPaper(null);
    setTotalMarks('');
  };

  const renderCourseSelection = () => {
    if (selectedCourse) {
      return (
        <View style={styles.selectedCourseContainer}>
          <Text style={styles.selectedCourseText}>
            {selectedCourse.code} - {selectedCourse.name}
          </Text>
          <TouchableOpacity 
            onPress={() => setSelectedCourse(null)}
            style={styles.clearSelectionButton}
          >
            <MaterialIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={courses}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.courseItem}
            onPress={() => setSelectedCourse(item)}
          >
            <Text style={styles.courseText}>
              {item.code} - {item.name}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.courseList}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Welcome, {user?.first_name || user?.username}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Exam Sessions</Text>
          {/* Future: Add list of existing sessions here */}
          <View style={styles.emptyState}>
            <MaterialIcons name="assignment" size={48} color="#aaa" />
            <Text style={styles.emptyStateText}>No exams created yet</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
  style={styles.fabContainer}
  onPress={() => setModalVisible(true)}
  activeOpacity={0.8}
>
  <View style={styles.fabContent}>
    <MaterialIcons name="add" size={24} color="#fff" />
    <Text style={styles.fabText}>New Session</Text>
  </View>
</TouchableOpacity>

      {/* Create Exam Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalScrollContainer}>
              <Text style={styles.modalTitle}>Create New Exam</Text>

              <Text style={styles.label}>Select Course</Text>
              {renderCourseSelection()}

              <Text style={styles.label}>Exam Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Midterm Exam, Final Exam, etc."
                value={title}
                onChangeText={setTitle}
              />

              <View style={styles.datetimeContainer}>
                <View style={styles.datetimeColumn}>
                  <Text style={styles.label}>Exam Date</Text>
                  <TouchableOpacity 
                    style={styles.datePickerBtn}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text>{date.toDateString()}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.datetimeColumn}>
                  <Text style={styles.label}>Exam Time</Text>
                  <TouchableOpacity 
                    style={styles.datePickerBtn}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text>{formatTime(time)}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  minimumDate={new Date()}
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(false);
                    if (selectedTime) setTime(selectedTime);
                  }}
                />
              )}

              <Text style={styles.label}>Total Marks</Text>
              <TextInput
                style={styles.input}
                placeholder="100"
                value={totalMarks}
                onChangeText={setTotalMarks}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Exam Paper (PDF)</Text>
              <TouchableOpacity 
                style={[styles.datePickerBtn, examPaper && styles.fileSelected]} 
                onPress={pickExamPaper}
              >
                <Text style={examPaper ? styles.fileSelectedText : styles.filePlaceholderText}>
                  {examPaper ? examPaper.name : 'Select PDF file'}
                </Text>
                {examPaper && (
                  <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                )}
              </TouchableOpacity>

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.submitBtn, loading && styles.disabledButton]}
                  onPress={handleCreateExam}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitText}>Create Exam</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.cancelBtn}
                  onPress={resetForm}
                  disabled={loading}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#444',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 10,
    color: '#888',
    fontSize: 16,
  },
  fabContainer: {
  position: 'absolute',
  bottom: 30,
  right: 10,
  backgroundColor: '#007bff',
  borderRadius: 28,
  paddingHorizontal: 20,
  paddingVertical: 12,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5,
},
fabContent: {
  flexDirection: 'row',
  alignItems: 'center',
},
fabText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
  marginLeft: 3,
},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalScrollContainer: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#555',
  },
  selectedCourseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  selectedCourseText: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '500',
  },
  clearSelectionButton: {
    padding: 4,
  },
  courseItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  courseText: {
    fontSize: 16,
    color: '#333',
  },
  courseList: {
    maxHeight: 150,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  datetimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  datetimeColumn: {
    width: '48%',
  },
  datePickerBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e9',
  },
  fileSelectedText: {
    color: '#2E7D32',
  },
  filePlaceholderText: {
    color: '#888',
  },
  buttonContainer: {
    marginTop: 10,
  },
  submitBtn: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelBtn: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  cancelText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
  },
});