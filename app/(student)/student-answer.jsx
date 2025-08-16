import React, { useEffect, useState } from "react";
import { 
  View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity 
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { API_URL } from "@env";
import { useAuth } from "../../context/AuthContext";

export default function StudentAnswer() {
  const { examId } = useLocalSearchParams();
  const { tokens } = useAuth();
  const router = useRouter();

  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnswers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/exams/${examId}/single-answer/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      setAnswers(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch answers:", err);
      setError("Failed to load answers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswers();
  }, [examId]);

  // Calculate total marks
  const totalMarks = answers.reduce((sum, ans) => sum + (ans.marks_awarded || 0), 0);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAnswers}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Marking Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {answers.length > 0 ? (
          answers.map((ans, index) => (
            <View key={ans.id || index} style={styles.card}>
              <Text style={styles.questionTitle}>
                Q{index + 1}: {ans.question_text}
              </Text>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Student’s Answer</Text>
                <Text style={styles.text}>{ans.answer_text}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Marks Awarded</Text>
                <Text style={styles.marks}>
                  {ans.marks_awarded} {ans.graded ? "" : "(Not graded yet)"}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Remarks</Text>
                <Text style={styles.text}>{ans.remarks || "No remarks provided"}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.text}>No answers found for this exam.</Text>
        )}

        {/* Total Marks Section */}
        <View style={styles.totalMarksContainer}>
          <Text style={styles.totalMarksTitle}>Total Marks:</Text>
          <Text style={styles.totalMarks}>{totalMarks}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "#dc3545", marginBottom: 10 },
  retryButton: { padding: 10, backgroundColor: "#007bff", borderRadius: 5 },
  retryText: { color: "#fff", fontWeight: "600" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  content: { padding: 15 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  questionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10, color: "#222" },
  section: { marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4, color: "#444" },
  text: { fontSize: 14, color: "#333", lineHeight: 20 },
  marks: { fontSize: 15, fontWeight: "700", color: "#007bff" },
  totalMarksContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  totalMarksTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  totalMarks: { fontSize: 18, fontWeight: "700", color: "#007bff" },
});