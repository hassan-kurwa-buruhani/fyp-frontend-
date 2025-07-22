// app/template/Drawer.jsx
import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerLayout } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

const Drawer = ({ children }) => {
  const drawerRef = useRef(null);
  const router = useRouter();

  const openDrawer = () => {
    if (drawerRef.current) {
      drawerRef.current.openDrawer();
    }
  };

  const closeDrawer = () => {
    if (drawerRef.current) {
      drawerRef.current.closeDrawer();
    }
  };

  // Define your menu items with label and path
  const navigationItems = [
    { label: 'Home', path: '/home' },
    { label: 'Profile', path: '/profile' },
  ];

  const onNavigate = (path) => {
    router.push(path);
    closeDrawer();
  };

  const renderDrawer = () => (
    <View style={styles.drawerContainer}>
      <Text style={styles.drawerTitle}>Menu</Text>
      {navigationItems.map(({ label, path }) => (
        <TouchableOpacity
          key={label}
          onPress={() => onNavigate(path)}
          style={styles.drawerItemTouchable}
          activeOpacity={0.7}
        >
          <Text style={styles.drawerItem}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <DrawerLayout
      ref={drawerRef}
      drawerWidth={250}
      drawerPosition="left"
      drawerType="front"
      drawerBackgroundColor="#fff"
      renderNavigationView={renderDrawer}
    >
      {/* Pass openDrawer function to children */}
      {typeof children === 'function' ? children({ openDrawer }) : children}
    </DrawerLayout>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#f2f2f2',
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  drawerItemTouchable: {
    marginVertical: 10,
  },
  drawerItem: {
    fontSize: 18,
  },
});

export default Drawer;
