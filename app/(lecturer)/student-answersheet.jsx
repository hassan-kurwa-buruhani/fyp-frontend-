import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API_URL } from '@env';
import { useAuth } from '../../context/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  ScrollView,
  RefreshControl,
  Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

export default function StudentAnswerSheet() {
  const params = useLocalSearchParams();
  const { id, name, course, course_name, time, marks } = params;
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const router = useRouter();
  const { tokens } = useAuth();
  const baseUrl = API_URL;

  const fetchAnswers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/exams/${id}/answers/`, {
        headers: {
          Authorization: `Bearer ${tokens.access}`,
        },
      });
      setAnswers(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch answers:', err);
      setError('Failed to load answer sheets. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnswers();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnswers();
  };

  const formatDateTime = (dateTimeString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleDateString(undefined, options);
  };

  const handleItemPress = (item) => {
    setSelectedAnswer(item);
    setModalVisible(true);
  };

  const renderAnswerItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.answerItem}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.answerHeader}>
        <Text style={styles.studentId}>{item.student}</Text>
        <View style={[
          styles.statusBadge,
          item.ocr_extracted ? styles.extractedBadge : styles.pendingBadge
        ]}>
          <Text style={styles.statusText}>
            {item.ocr_extracted ? 'Processed' : 'Pending'}
          </Text>
        </View>
      </View>
      
      <View style={styles.answerDetails}>
        <Text style={styles.marksText}>
          Marks: {item.total_marks || '0'} / {marks}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderAnswerDetails = () => {
    if (!selectedAnswer) return null;

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedAnswer.student}'s Answer Sheet</Text>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Exam Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Exam:</Text>
                <Text style={styles.detailValue}>{name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Course:</Text>
                <Text style={styles.detailValue}>{course} - {course_name}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Submission Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Invigilator:</Text>
                <Text style={styles.detailValue}>{selectedAnswer.invigilator || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Uploaded:</Text>
                <Text style={styles.detailValue}>{formatDateTime(selectedAnswer.uploaded_at)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={[
                  styles.detailValue,
                  selectedAnswer.ocr_extracted ? styles.statusProcessed : styles.statusPending
                ]}>
                  {selectedAnswer.ocr_extracted ? 'Processed' : 'Pending'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Marks:</Text>
                <Text style={[styles.detailValue, styles.marksText]}>
                  {selectedAnswer.total_marks || '0'} / {marks}
                </Text>
              </View>
            </View>

            {selectedAnswer.notes && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Extracted Answers</Text>
                <ScrollView 
                  style={styles.notesContainer}
                  contentContainerStyle={styles.notesContent}
                >
                  <Text style={styles.notesText}>
                    {selectedAnswer.notes.split('\r\n').map((line, index) => (
                      <Text key={index}>
                        {line}{'\n'}
                      </Text>
                    ))}
                  </Text>
                </ScrollView>
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.gradeButton]}
                onPress={() => {
                  setModalVisible(false);
                  router.push({
                    pathname: '/(lecturer)/grade-answersheet',
                    params: {
                      answerId: selectedAnswer.id,
                      examId: id,
                      examName: name,
                      studentId: selectedAnswer.student,
                      currentMarks: selectedAnswer.total_marks || '0',
                      maxMarks: marks,
                      answerPdf: selectedAnswer.pdf,
                      extractedText: selectedAnswer.notes || ''
                    }
                  });
                }}
              >
                <MaterialIcons name="grading" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Grade Answers</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.downloadButton]}
                onPress={() => Linking.openURL(selectedAnswer.pdf)}
              >
                <MaterialIcons name="file-download" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Download PDF</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAnswers}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name}</Text>
      </View>

      <View style={styles.examInfo}>
        <Text style={styles.courseText}>{course} - {course_name}</Text>
        <Text style={styles.timeText}>Exam Time: {time.substring(0, 5)}</Text>
        <Text style={styles.marksText}>Total Marks: {marks}</Text>
      </View>

      <FlatList
        data={answers}
        renderItem={renderAnswerItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007bff']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="assignment" size={48} color="#aaa" />
            <Text style={styles.emptyText}>No answer sheets submitted yet</Text>
          </View>
        }
      />

      {renderAnswerDetails()}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  examInfo: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  courseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  marksText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listContainer: {
    padding: 10,
  },
  answerItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  studentId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  extractedBadge: {
    backgroundColor: '#28a745',
  },
  pendingBadge: {
    backgroundColor: '#ffc107',
  },
  answerDetails: {
    marginTop: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 10,
    color: '#888',
    fontSize: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    marginRight: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  detailSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#555',
    width: 100,
  },
  detailValue: {
    flex: 1,
    color: '#333',
    fontSize: 15,
  },
  statusProcessed: {
    color: '#28a745',
  },
  statusPending: {
    color: '#ffc107',
  },
  notesContainer: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
  notesContent: {
    padding: 15,
  },
  notesText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  gradeButton: {
    backgroundColor: '#17a2b8',
  },
  downloadButton: {
    backgroundColor: '#6c757d',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
});