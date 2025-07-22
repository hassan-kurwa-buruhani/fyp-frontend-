import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const AppHeader = ({ title }) => {
  return (
    <View style={{
      height: 60,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      elevation: 4,
    }}>
      <Text style={{
        color: colors.surface,
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
      }}>
        {title}
      </Text>
      <TouchableOpacity>
        <MaterialIcons name="notifications" size={24} color={colors.surface} />
      </TouchableOpacity>
    </View>
  );
};