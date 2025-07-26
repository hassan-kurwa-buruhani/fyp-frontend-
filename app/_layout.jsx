import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import toastConfig from './constants/toastConfig'; // Make sure this is the correct path

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('@viewedOnboarding');
        if (value === null) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Error checking onboarding:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <PaperProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {showOnboarding ? (
              <Stack.Screen name="onboarding" />
            ) : (
              <>
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="login" />
                <Stack.Screen name="contact" />
                <Stack.Screen name="(public)" />
                <Stack.Screen name="(student)" />
                <Stack.Screen name="(lecturer)" />
                <Stack.Screen name="(invigilator)" />
                <Stack.Screen name="(admin)" />
              </>
            )}
          </Stack>
        </PaperProvider>
      </AuthProvider>
      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});