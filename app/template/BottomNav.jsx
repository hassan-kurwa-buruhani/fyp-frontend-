// import React from 'react';
// import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';
// import { useRouter, usePathname } from 'expo-router';
// import { themes } from '../constants/theme';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// const BottomNav = () => {
//   const theme = themes.light;
//   const router = useRouter();
//   const pathname = usePathname();
//   const insets = useSafeAreaInsets();

//   const currentRoute = pathname.split('/')[1]; // extract route name from path

//   const tabs = [
//     { name: 'Home', label: 'Home', icon: 'home' },
//     { name: 'Sessions', label: 'Sessions', icon: 'schedule' },
//     { name: 'Exams', label: 'Exams', icon: 'assignment' },
//     { name: 'Profile', label: 'Profile', icon: 'person' },
//   ];

//   const onPressTab = (name) => {
//     const lowercased = name.toLowerCase();
//     router.replace(`/${lowercased}`);
//   };

//   return (
//     <View
//       style={[
//         styles.container,
//         {
//           backgroundColor: theme.colors.surface,
//           borderTopColor: theme.colors.divider,
//           paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
//           height: 70 + (insets.bottom > 0 ? insets.bottom : 0),
//         },
//       ]}
//     >
//       {tabs.map(({ name, label, icon }) => {
//         const focused = currentRoute === name;
//         const iconColor = focused ? theme.colors.accent : theme.colors.textSecondary;
//         const textColor = focused ? theme.colors.accent : theme.colors.textSecondary;

//         return (
//           <TouchableOpacity
//             key={name}
//             style={styles.tabItem}
//             onPress={() => onPressTab(name)}
//             activeOpacity={0.7}
//           >
//             <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
//               <MaterialIcons 
//                 name={icon} 
//                 size={24} 
//                 color={iconColor} 
//               />
//               {focused && <View style={styles.activeIndicator} />}
//             </View>
//             <Text style={[
//               styles.label, 
//               { 
//                 color: textColor,
//                 fontWeight: focused ? '700' : '500',
//                 fontSize: focused ? 13 : 12
//               }
//             ]}>
//               {label}
//             </Text>
//           </TouchableOpacity>
//         );
//       })}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     borderTopWidth: StyleSheet.hairlineWidth,
//     justifyContent: 'space-around',
//     alignItems: 'center',
//   },
//   tabItem: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 8,
//   },
//   iconContainer: {
//     position: 'relative',
//     padding: 8,
//     borderRadius: 20,
//   },
//   activeIconContainer: {
//     backgroundColor: 'rgba(18, 24, 88, 0.1)', // 10% opacity of your accent color
//   },
//   activeIndicator: {
//     position: 'absolute',
//     top: -3,
//     width: 4,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: themes.light.colors.accent,
//     alignSelf: 'center',
//   },
//   label: {
//     marginTop: 4,
//     letterSpacing: 0.3,
//   },
// });

// export default BottomNav;


import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Theme colors (replace with your actual theme colors)
  const theme = {
    primary: '#0b1153ff',       // Dark blue (accent color)
    primaryLight: '#534bae',  // Lighter blue
    surface: '#FFFFFF',       // White background
    textPrimary: '#0a1b7cff',   // Dark text
    textSecondary: '#060531ff', // Gray text
    divider: '#E0E0E0',       // Border color
  };

  const currentRoute = pathname.split('/')[1] || 'home';

  const tabs = [
    { name: 'home', label: 'Home', icon: 'home' },
    { name: 'sessions', label: 'Sessions', icon: 'schedule' },
    { name: 'exams', label: 'Exams', icon: 'assignment' },
    { name: 'profile', label: 'Profile', icon: 'person' },
  ];

  const onPressTab = (name) => {
    router.replace(`/${name}`);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.divider,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
          height: 72 + (insets.bottom > 0 ? insets.bottom : 0),
        },
      ]}
    >
      {tabs.map(({ name, label, icon }) => {
        const focused = currentRoute === name;
        const iconColor = focused ? theme.textPrimary : theme.textSecondary;
        const textColor = focused ? theme.textPrimary : theme.textSecondary;

        return (
          <TouchableOpacity
            key={name}
            style={styles.tabItem}
            onPress={() => onPressTab(name)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <MaterialIcons 
                name={icon} 
                size={26} 
                color={iconColor} 
              />
              {focused && (
                <Animated.View style={[
                  styles.activeIndicator,
                  { backgroundColor: theme.primary }
                ]} />
              )}
            </View>
            <Text style={[
              styles.label,
              { 
                color: textColor,
                fontWeight: focused ? '600' : '500',
              }
            ]}>
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
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  iconContainer: {
    position: 'relative',
    padding: 10,
    borderRadius: 24,
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(8, 28, 247, 0.08)',
    width: 70,
    borderRadius: 7,
    alignItems: 'center',
    top: 2,
  },
  activeIndicator: {
    position: 'absolute',
    top: 1,
    width: 70,
    height: 2,
    borderRadius: 3,
    alignSelf: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.2,
    includeFontPadding: false, // Removes extra padding around text
  },
});

export default BottomNav;