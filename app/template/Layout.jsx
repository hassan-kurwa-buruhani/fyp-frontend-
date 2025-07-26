import React from 'react';
import { View, Text } from 'react-native'; // Make sure Text is imported
import Header from './Header';
import BottomNav from './BottomNav';
import { ThemeProvider, useTheme } from '../constants/ThemeContext';
import { Slot } from 'expo-router';

// Inner layout that applies theming and includes header and bottom nav
const ThemedLayout = () => {
  const { theme } = useTheme();

  // Add error handling in case theme is not available
  if (!theme) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading theme...</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: 2,
        paddingTop: 12,
      }}
    >
      <Header onMenuPress={() => {}} />
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
      <BottomNav />
    </View>
  );
};

const Layout = () => {
  return (
    <ThemeProvider>
      <ThemedLayout />
    </ThemeProvider>
  );
};

export default Layout;