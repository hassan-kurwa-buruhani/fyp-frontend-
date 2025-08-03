import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import ConfettiCannon from 'react-native-confetti-cannon';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function ScanAnswerSheets() {
  const params = useLocalSearchParams();
  const examId = params.id;
  const examName = params.name;
  const examTime = params.time;
  const examMarks = params.marks;
  const course = params.course;
  const courseName = params.course_name;
  const { tokens } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [ocrTriggered, setOcrTriggered] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [visibleQuestions, setVisibleQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [updating, setUpdating] = useState({});
  const [showVerifyButton, setShowVerifyButton] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const confettiRef = useRef(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      })
    ]).start();
    
    // Pulse animation for important actions
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const executeAfterDelay = async () => {
  await delay(3000);
  router.push({pathname: '/(lecturer)/home'});
};

  const triggerOCR = async () => {
    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const response = await axios.post(
        `${API_URL}/trigger-ocr-question-extraction/`,
        { exam_id: examId },
        { headers: { Authorization: `Bearer ${tokens.access}` } }
      );

      Alert.alert('Success', response.data.message || 'OCR triggered successfully');
      setOcrTriggered(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('OCR Trigger Error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to trigger OCR');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/exams/${examId}/questions/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      setQuestions(response.data);
      setVisibleQuestions([response.data[0]]); // Start with first question only
      Haptics.selectionAsync();
    } catch (error) {
      console.error('Fetch Questions Error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load questions');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const updateQuestion = async (question, index) => {
    setUpdating((prev) => ({ ...prev, [question.id]: true }));
    try {
      await axios.put(
        `${API_URL}/exams/${examId}/questions/${question.id}/`,
        {
          question_text: question.question_text,
          marks: question.marks,
          exam: question.exam,
          question_number: question.question_number,
        },
        {
          headers: { Authorization: `Bearer ${tokens.access}` },
        }
      );

      Alert.alert('Updated', `Question ${question.question_number} updated`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Show next question if any
      if (index + 1 < questions.length) {
        setVisibleQuestions((prev) => [...prev, questions[index + 1]]);
      } else {
        setShowVerifyButton(true);
      }
    } catch (error) {
      console.error('Update Error:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        `Failed to update question ${question.question_number}: ${
          JSON.stringify(error.response?.data) || 'Unknown error'
        }`
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setUpdating((prev) => ({ ...prev, [question.id]: false }));
    }
  };

  const handleTextChange = (text, index, field) => {
    const updated = [...questions];
    updated[index][field] = text;
    setQuestions(updated);
  };

  const confirmQuestions = () => {
    setCelebrate(true);
    confettiRef.current?.start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      '🎉 Success!',
      'Congratulations! You have finished setting up the exam. Wait for students to sit for it, and the system will handle grading.'
    );
    executeAfterDelay();
  };

  const renderQuestionItem = ({ item, index }) => (
    <Animated.View 
      key={item.id} 
      style={[
        styles.questionCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideUpAnim }]
        }
      ]}
    >
      <View style={styles.questionHeader}>
        <Text style={styles.qNumber}>Question {item.question_number}</Text>
        <MaterialIcons name="help-outline" size={20} color="#6c757d" />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Question Text</Text>
        <TextInput
          style={styles.input}
          value={item.question_text}
          onChangeText={(text) => handleTextChange(text, index, 'question_text')}
          multiline
          placeholder="Enter question text..."
          placeholderTextColor="#adb5bd"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Marks</Text>
        <TextInput
          style={[styles.input, styles.marksInput]}
          value={String(item.marks)}
          onChangeText={(text) => handleTextChange(text, index, 'marks')}
          keyboardType="numeric"
          placeholder="Enter marks..."
          placeholderTextColor="#adb5bd"
        />
      </View>

      {updating[item.id] ? (
        <ActivityIndicator size="small" color="#4e9af1" />
      ) : (
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => updateQuestion(item, index)}
        >
          <Text style={styles.saveButtonText}>
            <FontAwesome5 name="save" size={16} color="white" /> Save Changes
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={90}
    >
      <LinearGradient
        colors={['#f8f9fa', '#e9ecef']}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
         <Animated.View 
  style={[
    styles.header,
    {
      opacity: fadeAnim,
      transform: [{ translateY: slideUpAnim }]
    }
  ]}
>
  <Text style={styles.title}>Exam Setup</Text>
  <View style={styles.detailCard}>
    {/* Exam Title */}
    <View style={styles.detailRow}>
      <MaterialIcons name="assignment" size={20} color="#495057" />
      <Text style={styles.examDetail}>{examName}</Text>
    </View>
    
    {/* Course Information */}
    <View style={styles.detailRow}>
      <MaterialIcons name="school" size={20} color="#495057" />
      <Text style={styles.examDetail}>{course} - {courseName}</Text>
    </View>
    
    {/* Exam ID */}
    {/* <View style={styles.detailRow}>
      <MaterialIcons name="fingerprint" size={20} color="#495057" />
      <Text style={styles.examDetail}>Exam ID: {examId}</Text>
    </View> */}

    {/* Exam Time */}
    <View style={styles.detailRow}>
      <MaterialIcons name="access-time" size={20} color="#495057" />
      <Text style={styles.examDetail}>Exam Time: {examTime}</Text>
    </View>

    {/* Total Marks */}
    <View style={styles.detailRow}>
      <MaterialIcons name="score" size={20} color="#495057" />
      <Text style={styles.examDetail}>Total marks: {examMarks}</Text>
    </View>
  </View>
</Animated.View>
          {!ocrTriggered && (
            <Animated.View 
              style={[
                styles.buttonSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideUpAnim }, { scale: pulseAnim }]
                }
              ]}
            >
              {loading ? (
                <ActivityIndicator size="large" color="#4e9af1" />
              ) : (
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={triggerOCR}
                >
                  <Text style={styles.primaryButtonText}>
                    <FontAwesome5 name="robot" size={18} /> Trigger OCR Extraction
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}

          {ocrTriggered && (
            <Animated.View 
              style={[
                styles.ocrTriggeredSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideUpAnim }]
                }
              ]}
            >
              <View style={styles.successCard}>
                <MaterialIcons name="check-circle" size={24} color="#28a745" />
                <Text style={styles.successMsg}>OCR processing completed successfully</Text>
              </View>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={fetchQuestions}
              >
                <Text style={styles.secondaryButtonText}>
                  <FontAwesome5 name="file-alt" size={16} /> View Questions
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {questionsLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4e9af1" />
              <Text style={styles.loadingText}>Loading questions...</Text>
            </View>
          )}

          {visibleQuestions.map((item, index) => renderQuestionItem({ item, index }))}

          {showVerifyButton && (
            <Animated.View 
              style={[
                styles.verifySection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideUpAnim }, { scale: pulseAnim }]
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.successButton}
                onPress={confirmQuestions}
              >
                <Text style={styles.successButtonText}>
                  <AntDesign name="checkcircleo" size={18} /> Confirm Questions Setup
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {celebrate && (
            <ConfettiCannon
              count={200}
              origin={{ x: Dimensions.get('window').width / 2, y: -10 }}
              autoStart={false}
              fadeOut
              explosionSpeed={500}
              fallSpeed={3000}
              colors={['#4e9af1', '#28a745', '#ffc107', '#dc3545', '#17a2b8']}
              ref={confettiRef}
            />
          )}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  detailCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  examDetail: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
    color: '#495057',
  },
  buttonSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4e9af1',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#4e9af1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  ocrTriggeredSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7ee',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    width: '100%',
  },
  successMsg: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
  },
  secondaryButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4e9af1',
    width: '100%',
  },
  secondaryButtonText: {
    color: '#4e9af1',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6c757d',
    fontSize: 14,
  },
  questionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  qNumber: {
    fontWeight: '700',
    fontSize: 18,
    color: '#212529',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderColor: '#dee2e6',
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    color: '#212529',
  },
  marksInput: {
    width: 80,
  },
  saveButton: {
    backgroundColor: '#4e9af1',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  verifySection: {
    marginVertical: 30,
    alignItems: 'center',
  },
  successButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    width: '100%',
  },
  successButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});