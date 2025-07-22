import { View, ScrollView, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function LecturerHome() {
  // Add error boundary for useAuth
  let auth;
  try {
    auth = useAuth();
  } catch (error) {
    console.error("Auth context error:", error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Authentication error. Please restart the app.</Text>
      </View>
    );
  }

  // Destructure after ensuring auth exists
  const { user, logout, isLoading: authLoading } = auth || {};

  // Sample card data
  const cards = [
    {
      title: 'Active Courses',
      value: '4',
      subtitle: 'This semester',
      color: '#3F51B5' // primary
    },
    {
      title: 'Students',
      value: '87',
      subtitle: 'Total enrolled',
      color: '#009688' // secondary
    },
    {
      title: 'Assignments',
      value: '12',
      subtitle: 'Pending grading',
      color: '#FF5722' // accent
    },
    {
      title: 'Attendance',
      value: '92%',
      subtitle: 'Current average',
      color: '#43A047' // success
    }
  ];

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
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
        <Text style={styles.headerText}>Welcome, {user.first_name}</Text>
        <Text style={styles.subheaderText}>{user.role} Dashboard</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.cardGrid}>
        {cards.map((card, index) => (
          <View key={index} style={[styles.card, { backgroundColor: card.color }]}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
          </View>
        ))}
      </View>

      {/* Performance Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.cardHeading}>Performance Overview</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.placeholderText}>Chart will be displayed here</Text>
        </View>
      </View>

      {/* Attendance Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.cardHeading}>Attendance Trend</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.placeholderText}>Chart will be displayed here</Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.button, styles.outlineButton, styles.logoutButton]}
        onPress={() => {
          logout();
          router.replace('/login');
        }}
      >
        <Text style={styles.outlineButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
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
    color: '#757575'
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