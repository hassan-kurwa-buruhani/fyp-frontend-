import React, { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

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

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const result = await updateUserProfile(formData);
      
      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully');
        // Clear password fields after successful update
        setFormData(prev => ({
          ...prev,
          new_password: '',
          verify_password: ''
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

      <Button 
        title={loading ? 'Updating...' : 'Update Profile'} 
        onPress={handleUpdate} 
        disabled={loading} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f9f9f9',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  section: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
    color: '#555',
  },
});


// import React, { useEffect, useState } from 'react';
// import { View, TextInput, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
// import axios from 'axios';
// import { useAuth } from '../../context/AuthContext'
// import { API_URL } from '@env';

// export default function ProfileScreen() {
//   const { user, tokens } = useAuth();
//   const [formData, setFormData] = useState({
//     first_name: user?.first_name || '',
//     last_name: user?.last_name || '',
//     email: user?.email || '',
//     new_password: '',
//     verify_password: '',
//   });

//   const [loading, setLoading] = useState(false);
//   const baseUrl = API_URL;

//   const handleUpdate = async () => {
//     if (formData.new_password && formData.new_password !== formData.verify_password) {
//       Alert.alert('Error', 'Passwords do not match.');
//       return;
//     }

//     setLoading(true);
//     try {
//       const payload = {
//         first_name: formData.first_name,
//         last_name: formData.last_name,
//         email: formData.email,
//       };

//       if (formData.new_password) {
//         payload.new_password = formData.new_password;
//         payload.verify_password = formData.verify_password;
//       }

//       await axios.put(`${baseUrl}/profile/${user.id}/`, payload, {
//         headers: {
//           Authorization: `Bearer ${tokens?.access}`,
//         },
//       });

//       Alert.alert('Success', 'Profile updated successfully');
//     } catch (error) {
//       console.error('Update failed:', error.response?.data || error);
//       Alert.alert('Error', 'Update failed. Check your input.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Profile</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="First Name"
//         value={formData.first_name}
//         onChangeText={text => setFormData({ ...formData, first_name: text })}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Last Name"
//         value={formData.last_name}
//         onChangeText={text => setFormData({ ...formData, last_name: text })}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         keyboardType="email-address"
//         value={formData.email}
//         onChangeText={text => setFormData({ ...formData, email: text })}
//       />

//       <Text style={styles.section}>Change Password (optional)</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="New Password"
//         secureTextEntry
//         value={formData.new_password}
//         onChangeText={text => setFormData({ ...formData, new_password: text })}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Verify Password"
//         secureTextEntry
//         value={formData.verify_password}
//         onChangeText={text => setFormData({ ...formData, verify_password: text })}
//       />

//       <Button title={loading ? 'Updating...' : 'Update Profile'} onPress={handleUpdate} disabled={loading} />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     paddingTop: 60,
//     backgroundColor: '#f9f9f9',
//     flexGrow: 1,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#333',
//     textAlign: 'center',
//   },
//   input: {
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//     fontSize: 16,
//     marginBottom: 15,
//   },
//   section: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginVertical: 10,
//     color: '#555',
//   },
// });
