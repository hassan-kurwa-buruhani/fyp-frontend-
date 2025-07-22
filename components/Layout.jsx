import { Drawer } from 'expo-router/drawer';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const DrawerContent = () => {
  const router = useRouter();
  
  const menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/home' },
    { label: 'Courses', icon: 'book', route: '/courses' },
    { label: 'Schedule', icon: 'calendar-today', route: '/schedule' },
    { label: 'Grades', icon: 'assessment', route: '/grades' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  return (
    <View style={{ flex: 1, paddingTop: 50 }}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary }}>Academic Portal</Text>
        <Text style={{ color: colors.textSecondary }}>Welcome back!</Text>
      </View>
      
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }}
          onPress={() => router.push(item.route)}
        >
          <MaterialIcons name={item.icon} size={24} color={colors.textPrimary} />
          <Text style={{ marginLeft: 15, fontSize: 16 }}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export const AppLayout = ({ children }) => {
  return (
    <Drawer drawerContent={DrawerContent}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <AppHeader />
        <View style={{ flex: 1 }}>
          {children}
        </View>
        <AppFooter />
      </View>
    </Drawer>
  );
};