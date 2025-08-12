import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
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
  Modal,
  TextInput
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examDetailsVisible, setExamDetailsVisible] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questionsVisible, setQuestionsVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionVisible, setQuestionVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();
  const { tokens } = useAuth();
  const baseUrl = API_URL;

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/exams/`, {
        headers: {
          Authorization: `Bearer ${tokens.access}`,
        },
      });
      setExams(response.data);
      setFilteredExams(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch exams:', err);
      setError('Failed to load exams. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchQuestions = async (examId) => {
    try {
      const response = await axios.get(`${baseUrl}/exams/${examId}/questions/`, {
        headers: {
          Authorization: `Bearer ${tokens.access}`,
        },
      });
      setQuestions(response.data);
      setQuestionsVisible(true);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
      alert('Failed to load questions. Please try again.');
    }
  };

  useEffect(() => {
    if (tokens?.access) {
      fetchExams();
    }
  }, [tokens]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredExams(exams);
    } else {
      const filtered = exams.filter(exam => 
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.course_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredExams(filtered);
    }
  }, [searchQuery, exams]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchExams();
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5); // Returns HH:MM format
  };

  const renderExamItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.examItem}
      onPress={() => {
        setSelectedExam(item);
        setExamDetailsVisible(true);
      }}
    >
      <View style={styles.examHeader}>
        <Text style={styles.examTitle}>{item.title}</Text>
        <View style={[
          styles.statusBadge,
          item.graded ? styles.gradedBadge : styles.pendingBadge
        ]}>
          <Text style={styles.statusText}>
            {item.graded ? 'Graded' : 'Pending'}
          </Text>
        </View>
      </View>
      <Text style={styles.examCourse}>{item.course} - {item.course_name}</Text>
      <View style={styles.examFooter}>
        <Text style={styles.examDate}>{formatDate(item.date)}</Text>
        <Text style={styles.examMarks}>{item.total_marks} marks</Text>
      </View>
    </TouchableOpacity>
  );

  const renderExamDetails = () => {
    if (!selectedExam) return null;

    return (
      <Modal
        visible={examDetailsVisible}
        animationType="slide"
        onRequestClose={() => setExamDetailsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setExamDetailsVisible(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedExam.title}</Text>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Exam Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Course:</Text>
                <Text style={styles.detailValue}>
                  {selectedExam.course} - {selectedExam.course_name}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(selectedExam.date)} at {formatTime(selectedExam.time)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Marks:</Text>
                <Text style={styles.detailValue}>{selectedExam.total_marks}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={[
                  styles.detailValue,
                  selectedExam.graded ? styles.statusGraded : styles.statusPending
                ]}>
                  {selectedExam.graded ? 'Graded' : 'Pending'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Students Pending:</Text>
                <Text style={styles.detailValue}>
                  {selectedExam.students_pending_submission?.length || 0}
                </Text>
              </View>
            </View>

            {selectedExam.exam_paper && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Exam Paper</Text>
                <TouchableOpacity 
                  style={styles.downloadButton}
                  onPress={() => Linking.openURL(selectedExam.exam_paper)}
                >
                  <MaterialIcons name="file-download" size={20} color="#fff" />
                  <Text style={styles.downloadButtonText}>Download Exam Paper</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.primaryButton]}
                onPress={() => {
                  fetchQuestions(selectedExam.id);
                  setExamDetailsVisible(false);
                }}
              >
                <MaterialIcons name="question-answer" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>View Questions</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const renderQuestionsList = () => {
    return (
      <Modal
        visible={questionsVisible}
        animationType="slide"
        onRequestClose={() => setQuestionsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => {
                setQuestionsVisible(false);
                setExamDetailsVisible(true);
              }}
              style={styles.closeButton}
            >
              <MaterialIcons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedExam?.title} Questions
            </Text>
          </View>

          <FlatList
            data={questions}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.questionItem}
                onPress={() => {
                  setSelectedQuestion(item);
                  setQuestionVisible(true);
                }}
              >
                <Text style={styles.questionNumber}>{item.question_number}</Text>
                <Text style={styles.questionMarks}>{item.marks} marks</Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      </Modal>
    );
  };

  const renderQuestionDetails = () => {
    if (!selectedQuestion) return null;

    return (
      <Modal
        visible={questionVisible}
        animationType="slide"
        onRequestClose={() => setQuestionVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setQuestionVisible(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Question {selectedQuestion.question_number}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Question Text</Text>
              <Text style={styles.questionText}>
                {selectedQuestion.question_text}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Marks:</Text>
              <Text style={styles.detailValue}>{selectedQuestion.marks}</Text>
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchExams}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exams..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredExams}
        renderItem={renderExamItem}
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
            <Text style={styles.emptyText}>
              {searchQuery ? 'No matching exams found' : 'No exams available'}
            </Text>
          </View>
        }
      />

      {renderExamDetails()}
      {renderQuestionsList()}
      {renderQuestionDetails()}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    padding: 15,
    paddingTop: 5,
  },
  examItem: {
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
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
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
  gradedBadge: {
    backgroundColor: '#28a745',
  },
  pendingBadge: {
    backgroundColor: '#ffc107',
  },
  examCourse: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  examFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  examDate: {
    fontSize: 13,
    color: '#666',
  },
  examMarks: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
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
  },
  detailSection: {
    marginBottom: 20,
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
    width: 120,
  },
  detailValue: {
    flex: 1,
    color: '#333',
    fontSize: 15,
  },
  statusGraded: {
    color: '#28a745',
  },
  statusPending: {
    color: '#ffc107',
  },
  downloadButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  actionButtons: {
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 5,
  },
  primaryButton: {
    backgroundColor: '#17a2b8',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  // Questions list styles
  questionItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  questionMarks: {
    fontSize: 14,
    color: '#666',
  },
  // Question details styles
  questionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 15,
  },
});