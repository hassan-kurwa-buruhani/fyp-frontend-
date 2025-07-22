import { Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function StudentLayout() {
  const { user } = useAuth();
  
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#333',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="home" 
        options={{ 
          title: `Invigilator Dashboard`,
          headerBackVisible: false,
        }} 
      />
    </Stack>
  );
}