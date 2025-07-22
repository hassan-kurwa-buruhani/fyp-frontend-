import { View, Text, Pressable } from 'react-native';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function InvigilatorHome() {
  const { user, logout } = useAuth();
  
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Welcome, {user?.username} ({user.role})
      </Text>
      
      <Pressable
        onPress={() => {
          logout();
          router.replace('/login');
        }}
        style={{
          backgroundColor: '#ff3b30',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>Logout</Text>
      </Pressable>
    </View>
  );
}