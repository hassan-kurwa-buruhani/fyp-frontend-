// app/template/Layout.jsx
import React from 'react';
import { View } from 'react-native';
import Drawer from './Drawer';
import Header from './Header';
import { ThemeProvider, useTheme } from '../constants/ThemeContext';
import { Slot } from 'expo-router';
import BottomNav from './BottomNav';

// Inner layout component to consume theme and apply only themed styles
const ThemedLayout = () => {
  const { theme } = useTheme(); 

  return (
    <Drawer>
      {({ openDrawer }) => (
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.background,
            paddingHorizontal: 16,
            paddingTop: 12,
          }}
        >
          <Header onMenuPress={openDrawer} />
          <View style={{ flex: 1 }}>
            <Slot />
          </View>
          <BottomNav />
        </View>
      )}
    </Drawer>
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
