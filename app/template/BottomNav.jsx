import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { themes } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BottomNav = () => {
  const theme = themes.light;
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  // Determine active route from current URL segments to highlight the active tab
  const currentRoute = segments[segments.length - 1]; // e.g. 'dashboard'

  const tabs = [
    { name: 'Home', label: 'Home', icon: 'home' },
    { name: 'Sessions', label: 'Sessions', icon: 'schedule' },
    { name: 'Exams', label: 'Exams', icon: 'assignment' },
    { name: 'Profile', label: 'Profile', icon: 'person' },
  ];

  const onPressTab = (name) => {
    const lowercased = name.toLowerCase();
    router.replace(`/${lowercased}`);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.divider,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 6, // respect insets, or fallback to 6
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
        },
      ]}
    >
      {tabs.map(({ name, label, icon }) => {
        const focused = currentRoute === name;
        const color = focused ? theme.colors.accent : theme.colors.textSecondary;

        return (
          <TouchableOpacity
            key={name}
            style={styles.tabItem}
            onPress={() => onPressTab(name)}
            activeOpacity={0.7}
          >
            <MaterialIcons name={icon} size={24} color={color} />
            <Text style={[styles.label, { color, fontWeight: focused ? '700' : '500' }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

export default BottomNav;
