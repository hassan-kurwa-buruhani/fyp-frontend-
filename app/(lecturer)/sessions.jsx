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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

export default function Sessions() {
  const [modalVisible, setModalVisible] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourseCode, setSelectedCourseCode] = useState(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();
  const { user, tokens } = useAuth();

  const baseUrl = API_URL;

  useEffect(() => {
    if (!tokens?.access) return;

    axios.get(`${baseUrl}/lecturer-course/`, {
      headers: {
        Authorization: `Bearer ${tokens.access}`,
      },
    })
      .then(response => {
        setCourses(response.data);
      })
      .catch(error => {
        console.error('Failed to load courses:', error);
        alert('Could not fetch courses. Please try again.');
      });
  }, [tokens]);

  const handleCreateExam = () => {
    axios.post(`${baseUrl}/exams/`, {
      title,
      date: date.toISOString().split('T')[0],
      course: selectedCourseCode,
    }, {
      headers: {
        Authorization: `Bearer ${tokens.access}`,
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        const data = response.data;
        console.log('Exam created', data);
        setModalVisible(false);
        setTitle('');
        setSelectedCourseCode(null);

        // Navigate to answersheet screen and pass examId as a param
        router.push({
          pathname: '/(lecturer)/answersheet',
          params: { id: data.id,
            name : data.title,
            course : data.course,
            course_name : data.course_name,
           }  
        });
      })
      .catch(error => {
        console.error('Error creating exam:', error);
        alert('Failed to create exam. Please try again.');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.username}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Sessions</Text>
        {/* Add list of sessions here later */}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fabContainer}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.fabContent}>
          <Text style={styles.fabIcon}>+</Text>
          <Text style={styles.fabText}>New Session</Text>
        </View>
      </TouchableOpacity>

      {/* Modal for creating exam */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create New Exam</Text>

            {/* Course Dropdown */}
            <Text style={styles.label}>Select Course</Text>
            <FlatList
              data={courses}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.courseItem,
                    selectedCourseCode === item.code && styles.selectedCourse,
                  ]}
                  onPress={() => setSelectedCourseCode(item.code)}
                >
                  <Text style={styles.courseText}>
                    {item.code} - {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.courseList}
            />

            {/* Exam Title */}
            <Text style={styles.label}>Exam Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter exam title"
              value={title}
              onChangeText={setTitle}
            />

            {/* Date Picker */}
            <Text style={styles.label}>Exam Date</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text style={styles.datePickerBtn}>
                {date.toDateString()}
              </Text>
            </TouchableOpacity>
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

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateExam}>
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    elevation: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#007bff',
    borderRadius: 28,
    padding: 16,
    elevation: 5,
  },
  fabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 6,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  label: { marginTop: 12, marginBottom: 4, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  courseItem: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f4f4f4',
    marginBottom: 6,
  },
  selectedCourse: {
    backgroundColor: '#cce5ff',
  },
  courseText: { fontSize: 16 },
  datePickerBtn: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: 8,
  },
  submitBtn: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelText: {
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
  },
});
