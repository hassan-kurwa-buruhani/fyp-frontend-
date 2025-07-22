import { View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export const AppFooter = () => {
  const router = useRouter();
  
  const tabs = [
    { icon: 'home', route: '/home' },
    { icon: 'search', route: '/search' },
    { icon: 'add-circle', route: '/create' },
    { icon: 'bookmark', route: '/saved' },
    { icon: 'person', route: '/profile' },
  ];

  return (
    <View style={{
      flexDirection: 'row',
      height: 60,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    }}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.route}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          onPress={() => router.push(tab.route)}
        >
          <MaterialIcons 
            name={tab.icon} 
            size={28} 
            color={router.pathname === tab.route ? colors.primary : colors.textSecondary} 
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};