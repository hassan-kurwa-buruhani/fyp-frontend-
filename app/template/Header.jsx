import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Menu, Avatar, Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const Header = ({ title = 'Grading Portal' }) => {
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuth();
  const router = useRouter();

  const [menuVisible, setMenuVisible] = useState(false);
  const [fontsLoaded] = useFonts({ Pacifico_400Regular });

  if (!fontsLoaded) return null;

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleProfile = () => {
    closeMenu();
    router.push({ pathname: '/profile' });
  };

  const handleLogout = () => {
    closeMenu();
    logout();
    router.push({ pathname: '/login' });
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <Text style={styles.title}>{title}</Text>

      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchor={
          <TouchableOpacity onPress={openMenu} activeOpacity={0.7}>
            <Avatar.Text
              size={36}
              label={
                user
                  ? `${user.first_name?.charAt(0).toUpperCase()}${user.last_name?.charAt(0).toUpperCase() || ''}`
                  : 'U'
              }
              style={styles.avatar}
              color="#fff"
            />
          </TouchableOpacity>
        }
        anchorPosition="bottom"
        contentStyle={styles.menu}
        style={styles.menuPosition}
      >
        <Menu.Item
          onPress={handleProfile}
          title="Profile"
          titleStyle={styles.menuItemText}
          style={styles.menuItem}
        />
        <Divider style={styles.divider} />
        <Menu.Item
          onPress={handleLogout}
          title="Logout"
          titleStyle={[styles.menuItemText, styles.logoutText]}
          style={styles.menuItem}
        />
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingBottom: 12,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Pacifico_400Regular',
    color: '#1A237E',
  },
  avatar: {
    backgroundColor: '#1A237E',
    marginTop: 4,
  },
  menu: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    minWidth: 180,
    marginTop: 8, // Creates space between avatar and menu
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  menuPosition: {
    marginRight: -16, // Pulls menu to align with avatar
    marginTop: 10, // Adjust this to position the menu vertically
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  logoutText: {
    color: '#D32F2F',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
  },
});

export default Header;