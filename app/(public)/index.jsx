import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function PublicHome() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Welcome to Exam Portal</Text>
      
      <Pressable
        onPress={() => router.push('/login')}
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>Login</Text>
      </Pressable>
    </View>
  );
}