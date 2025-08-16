import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, updateUserProfile } = useAuth();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    new_password: '',
    verify_password: '',
  });

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleUpdate = async () => {
    if (formData.new_password && formData.new_password !== formData.verify_password) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await updateUserProfile(formData);
      if (result.success) {
        setModalVisible(false);
        setFormData(prev => ({
          ...prev,
          new_password: '',
          verify_password: '',
        }));
      } else {
        Alert.alert('Error', result.error || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>

      <View style={styles.row}>
          <MaterialIcons name="alternate-email" size={24} color="#3F51B5" />
          <Text style={styles.infoText}>{user?.username}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="person" size={24} color="#3F51B5" />
          <Text style={styles.infoText}>
            {user?.first_name} {user?.last_name}
          </Text>
        </View>

      

        <View style={styles.row}>
          <MaterialIcons name="email" size={22} color="#3F51B5" />
          <Text style={styles.infoText}>{user?.email}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="work" size={22} color="#3F51B5" />
          <Text style={styles.infoText}>{user?.role}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="school" size={22} color="#3F51B5" />
          <Text style={styles.infoText}>{user?.student_registration_number}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons
            name={user?.gender === 'Male' ? 'male' : 'female'}
            size={22}
            color={user?.gender === 'Male' ? '#2196F3' : '#E91E63'}
          />
          <Text style={styles.infoText}>{user?.gender}</Text>
        </View>

        <Pressable style={styles.editButton} onPress={() => setModalVisible(true)}>
          <MaterialIcons name="edit" size={18} color="#fff" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </Pressable>
      </View>

      {/* Update Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Profile</Text>

            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={formData.first_name}
              onChangeText={text => setFormData({ ...formData, first_name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={formData.last_name}
              onChangeText={text => setFormData({ ...formData, last_name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={text => setFormData({ ...formData, email: text })}
            />

            <Text style={styles.section}>Change Password (optional)</Text>

            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={formData.new_password}
              onChangeText={text => setFormData({ ...formData, new_password: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Verify Password"
              secureTextEntry
              value={formData.verify_password}
              onChangeText={text => setFormData({ ...formData, verify_password: text })}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdate}
                disabled={loading}
              >
                <Text style={styles.saveText}>
                  {loading ? 'Saving...' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3F51B5',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  section: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
    color: '#555',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#ddd',
    marginRight: 10,
  },
  cancelText: {
    fontWeight: '600',
    color: '#555',
  },
  saveButton: {
    backgroundColor: '#3F51B5',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
});
