// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
// import { useAuth } from '../../context/';
// import { API_URL } from '@env';
// import { MaterialIcons } from '@expo/vector-icons';
// import axios from 'axios';

// const ExamSelectionScreen = ({ navigation }) => {
//   const [exams, setExams] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { tokens } = useAuth();

//   useEffect(() => {
//     const fetchExams = async () => {
//       try {
//         const response = await axios.get(`${API_URL}/exams-invigilator/`, {
//           headers: {
//             Authorization: `Bearer ${tokens.access}`,
//           },
//         });
//         setExams(response.data);
//       } catch (error) {
//         console.error('Error fetching exams:', error);
//         alert('Failed to load exams. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchExams();
//   }, []);

//   const renderExamCard = ({ item }) => (
//     <TouchableOpacity 
//       style={[styles.examCard, item.graded && styles.gradedCard]}
//       onPress={() => navigation.navigate('GradingScreen', { examId: item.id })}
//       disabled={item.graded}
//     >
//       <View style={styles.cardHeader}>
//         <Text style={styles.courseCode}>{item.course}</Text>
//         <View style={styles.statusBadge}>
//           <Text style={styles.statusText}>
//             {item.graded ? 'GRADED' : 'PENDING'}
//           </Text>
//         </View>
//       </View>
      
//       <Text style={styles.courseName}>{item.course_name}</Text>
//       <Text style={styles.examTitle}>{item.title}</Text>
      
//       <View style={styles.examDetails}>
//         <View style={styles.detailRow}>
//           <MaterialIcons name="event" size={16} color="#6c757d" />
//           <Text style={styles.detailText}>{item.date}</Text>
//         </View>
//         <View style={styles.detailRow}>
//           <MaterialIcons name="access-time" size={16} color="#6c757d" />
//           <Text style={styles.detailText}>{item.time.slice(0,5)}</Text>
//         </View>
//       </View>

//       {!item.graded && (
//         <View style={styles.selectButton}>
//           <Text style={styles.selectButtonText}>Select to Grade</Text>
//           <MaterialIcons name="arrow-forward" size={20} color="#fff" />
//         </View>
//       )}
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Select Exam to Grade</Text>
      
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#007bff" />
//         </View>
//       ) : exams.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <MaterialIcons name="assignment" size={48} color="#adb5bd" />
//           <Text style={styles.emptyText}>No exams available for grading</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={exams}
//           renderItem={renderExamCard}
//           keyExtractor={item => item.id.toString()}
//           contentContainerStyle={styles.listContainer}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//     padding: 16,
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#343a40',
//     marginBottom: 20,
//     marginTop: 10,
//   },
//   examCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   gradedCard: {
//     opacity: 0.7,
//     backgroundColor: '#f1f3f5',
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   courseCode: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#212529',
//   },
//   statusBadge: {
//     backgroundColor: '#e9ecef',
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     alignSelf: 'flex-start',
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#495057',
//   },
//   courseName: {
//     fontSize: 16,
//     color: '#495057',
//     marginBottom: 4,
//   },
//   examTitle: {
//     fontSize: 14,
//     color: '#6c757d',
//     marginBottom: 12,
//   },
//   examDetails: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   detailText: {
//     marginLeft: 4,
//     color: '#6c757d',
//     fontSize: 14,
//   },
//   selectButton: {
//     backgroundColor: '#007bff',
//     borderRadius: 8,
//     padding: 12,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   selectButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     marginRight: 8,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyText: {
//     marginTop: 16,
//     color: '#adb5bd',
//     fontSize: 16,
//   },
//   listContainer: {
//     paddingBottom: 20,
//   },
// });

// export default ExamSelectionScreen;