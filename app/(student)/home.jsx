import { 
  View, 
  ScrollView, 
  Text, 
  ActivityIndicator, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '@env';

export default function StudentHome() {
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let auth;
  try {
    auth = useAuth();
  } catch (error) {
    console.error("Auth context error:", error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Authentication error. Please restart the app.
        </Text>
      </View>
    );
  }

  const { user, isLoading: authLoading, tokens } = auth || {};

  // Fetch courses + exams
  const fetchData = async () => {
    if (!tokens?.access) return;
    try {
      setLoading(true);

      const [coursesResponse, examsResponse] = await Promise.all([
        axios.get(`${API_URL}/student-course/`, {
          headers: { Authorization: `Bearer ${tokens.access}` },
        }),
        axios.get(`${API_URL}/student-exams/`, {
          headers: { Authorization: `Bearer ${tokens.access}` },
        }),
      ]);

      setCourses(coursesResponse.data);
      setExams(examsResponse.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tokens]);

  // Student stats
  const cards = [
    {
      title: 'Enrolled Courses',
      value: courses.length.toString(),
      subtitle: 'This semester',
      color: '#3F51B5',
    },
    {
      title: 'Exams Registered',
      value: exams.length.toString(),
      subtitle: 'Registered',
      color: '#FF5722',
    },
    {
      title: 'Attendance',
      value: '92%',
      subtitle: 'Current average',
      color: '#43A047',
    },
    {
      title: 'GPA',
      value: '3.7',
      subtitle: 'Cumulative',
      color: '#009688',
    },
  ];

  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={[styles.button, styles.outlineButton]}
          onPress={fetchData}
        >
          <Text style={styles.outlineButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.bodyText}>No user data available</Text>
        <TouchableOpacity
          style={[styles.button, styles.outlineButton]}
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.outlineButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      style={styles.background}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Hi, {user.first_name}</Text>
        <Text style={styles.subheaderText}>Student Dashboard</Text>
      </View>

      {/* Stats */}
      <View style={styles.cardGrid}>
        {cards.map((card, index) => (
          <View key={index} style={[styles.card, { backgroundColor: card.color }]}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
          </View>
        ))}
      </View>

      {/* Enrolled Courses */}
      <View style={styles.chartCard}>
        <Text style={styles.cardHeading}>Your Courses</Text>
        {courses.length > 0 ? (
          courses.slice(0, 3).map(course => (
            <View key={course.id} style={styles.courseItem}>
              <Text style={styles.courseCode}>{course.code}</Text>
              <Text style={styles.courseName}>{course.name}</Text>
              <Text style={styles.courseStudents}>
                Lecturer: {course.lecturer_fullname || "N/A"}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.placeholderText}>You are not enrolled in any courses</Text>
        )}
        {courses.length > 3 && (
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/(student)/courses')}
          >
            <Text style={styles.viewAllText}>View All Courses</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Upcoming Exams */}
      <View style={styles.chartCard}>
        <Text style={styles.cardHeading}>Registered Exams</Text>
        {exams.length > 0 ? (
          exams.slice(0, 3).map(exam => (
            <View key={exam.id} style={styles.courseItem}>
              <Text style={styles.courseCode}>{exam.title}</Text>
              <Text style={styles.courseName}>
                {exam.course_code} - {exam.course_name}
              </Text>
              <Text style={styles.courseStudents}>
                {formatDate(exam.date)} at {exam.time.substring(0, 5)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.placeholderText}>No exams scheduled</Text>
        )}
        {exams.length > 3 && (
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/(student)/exams')}
          >
            <Text style={styles.viewAllText}>View All Exams</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

// Helper to format exam date
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

const styles = StyleSheet.create({
  // Layout Styles
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20
  },
  background: {
    backgroundColor: '#F5F5F6'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },

  // Header Styles
  headerContainer: {
    padding: 20,
    paddingBottom: 0
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8
  },
  subheaderText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 24
  },

  // Card Grid Styles
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24
  },
  card: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
    minHeight: 120,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500'
  },
  cardValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4
  },
  cardSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9
  },

  // Chart Card Styles
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#F5F5F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8
  },
  placeholderText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center'
  },

  // Course Item Styles
  courseItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  courseCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  courseName: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  courseStudents: {
    fontSize: 12,
    color: '#888',
    marginTop: 4
  },
  viewAllButton: {
    padding: 10,
    alignItems: 'center',
    marginTop: 10
  },
  viewAllText: {
    color: '#3F51B5',
    fontWeight: '500'
  },

  // Button Styles
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3F51B5'
  },
  outlineButtonText: {
    color: '#3F51B5',
    fontSize: 16,
    fontWeight: '500'
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 24
  },

  // Text Styles
  bodyText: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 20
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 20
  }
});
