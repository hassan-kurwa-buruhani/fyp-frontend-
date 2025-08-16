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
  FlatList,
  ScrollView,
  Linking,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

export default function Sessions() {
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examDetailsVisible, setExamDetailsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { user, tokens } = useAuth();
  const baseUrl = API_URL;

  useEffect(() => {
    if (!tokens?.access) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesResponse, examsResponse] = await Promise.all([
          axios.get(`${baseUrl}/student-course/`, {
            headers: {
              Authorization: `Bearer ${tokens.access}`,
            },
          }),
          axios.get(`${baseUrl}/student-exams/`, {
            headers: {
              Authorization: `Bearer ${tokens.access}`,
            },
          })
        ]);
        
        setCourses(coursesResponse.data);
        setExams(examsResponse.data);
      } catch (error) {
        console.error('Failed to load data:', error);
        alert('Could not fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tokens]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderExamItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.examItem}
      onPress={() => {
        setSelectedExam(item);
        setExamDetailsVisible(true);
      }}
    >
      <View style={styles.examItemHeader}>
        <Text style={styles.examTitle}>{item.title}</Text>
        <Text style={styles.examCourse}>{item.course}</Text>
      </View>
      <View style={styles.examItemDetails}>
        <Text style={styles.examDate}>{formatDate(item.date)}</Text>
        <Text style={styles.examTime}>{item.time.substring(0, 5)}</Text>
      </View>
      <View style={styles.examStatusContainer}>
        <View style={[
          styles.examStatusBadge,
          item.graded ? styles.gradedBadge : styles.pendingBadge
        ]}>
          <Text style={styles.examStatusText}>
            {item.graded ? 'Graded' : 'Pending'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderExamDetails = () => {
    if (!selectedExam) return null;

    return (
      <Modal visible={examDetailsVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContainer}>
            <ScrollView contentContainerStyle={styles.modalScrollContainer}>
              <Text style={styles.modalTitle}>{selectedExam.title}</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Course:</Text>
                <Text style={styles.detailValue}>
                  {selectedExam.course} - {selectedExam.course_name}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(selectedExam.date)} at {selectedExam.time.substring(0, 5)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Marks:</Text>
                <Text style={styles.detailValue}>{selectedExam.total_marks}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View style={[
                  styles.statusBadge,
                  selectedExam.graded ? styles.gradedBadge : styles.pendingBadge
                ]}>
                  <Text style={styles.statusText}>
                    {selectedExam.graded ? 'Graded' : 'Pending'}
                  </Text>
                </View>
              </View>

              {selectedExam.exam_paper && (
                <>
                  <Text style={styles.sectionTitle}>Exam Paper</Text>
                  <TouchableOpacity 
                    style={styles.downloadButton}
                    onPress={() => Linking.openURL(selectedExam.exam_paper)}
                  >
                    <MaterialIcons name="file-download" size={24} color="#fff" />
                    <Text style={styles.downloadButtonText}>Download Exam Paper</Text>
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.detailsButtonContainer}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.viewAnswersButton]}
                  onPress={() => {
                    setExamDetailsVisible(false);
                    router.push({
                      pathname: '/(student)/student-answersheet',
                      params: {
                        id: selectedExam.id,
                        name: selectedExam.title,
                        course: selectedExam.course,
                        course_name: selectedExam.course_name,
                        time: selectedExam.time,
                        marks: selectedExam.total_marks
                      },
                    });
                  }}
                >
                  <Text style={styles.actionButtonText}>View Your Answers</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButton, styles.closeButton]}
                  onPress={() => setExamDetailsVisible(false)}
                >
                  <Text style={styles.actionButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Welcome, {user?.first_name || user?.username}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Exam Sessions</Text>
          
          {exams.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="assignment" size={48} color="#aaa" />
              <Text style={styles.emptyStateText}>No exams available yet</Text>
            </View>
          ) : (
            <FlatList
              data={exams}
              renderItem={renderExamItem}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.examList}
            />
          )}
        </View>
      </ScrollView>

      {/* Exam Details Modal */}
      {renderExamDetails()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  detailsModalContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    maxHeight: '80%',
    width: '90%',
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
  examList: {
    paddingBottom: 10,
  },
  examItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  examItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  examCourse: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 10,
  },
  examItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  examDate: {
    fontSize: 14,
    color: '#666',
  },
  examTime: {
    fontSize: 14,
    color: '#666',
  },
  examStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  examStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  examStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  pendingBadge: {
    backgroundColor: '#ffc107',
  },
  gradedBadge: {
    backgroundColor: '#28a745',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  detailLabel: {
    fontWeight: '600',
    color: '#555',
    width: 100,
  },
  detailValue: {
    flex: 1,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#444',
  },
  downloadButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  detailsButtonContainer: {
    marginTop: 20,
  },
  actionButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  viewAnswersButton: {
    backgroundColor: '#17a2b8',
  },
  closeButton: {
    backgroundColor: '#6c757d',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});