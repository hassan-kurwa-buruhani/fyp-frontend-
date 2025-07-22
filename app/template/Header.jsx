// app/template/Header.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../constants/ThemeContext';

const Header = ({ title = 'Your Page Title', onMenuPress }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme(); // Get theme from context

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top,
          height: 56 + insets.top,
          backgroundColor: theme.colors.primary,
          borderBottomColor: theme.colors.divider,
          elevation: Platform.OS === 'android' ? 4 : 0,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onMenuPress}
        style={styles.menuButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <MaterialIcons
          name="menu"
          size={28}
          color={theme.colors.textInverted}
        />
      </TouchableOpacity>
      <Text
        style={[
          theme.typography.h1,
          { flexShrink: 1, color: theme.colors.textInverted, marginBottom: 0 },
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: Platform.OS === 'android' ? 0 : StyleSheet.hairlineWidth,
  },
  menuButton: {
    marginRight: 12,
  },
});

export default Header;
