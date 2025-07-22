import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const Input = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  error, 
  icon,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text style={{
          fontSize: 14,
          color: colors.textPrimary,
          marginBottom: 8,
          fontWeight: '500',
        }}>
          {label}
        </Text>
      )}
      
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: error ? colors.error : colors.divider,
        borderRadius: 8,
        backgroundColor: colors.surface,
        paddingHorizontal: 12,
      }}>
        {icon && (
          <MaterialIcons 
            name={icon} 
            size={20} 
            color={colors.textSecondary} 
            style={{ marginRight: 8 }} 
          />
        )}
        
        <TextInput
          style={{
            flex: 1,
            height: 48,
            color: colors.textPrimary,
            fontSize: 16,
          }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry && !showPassword}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialIcons 
              name={showPassword ? 'visibility-off' : 'visibility'} 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={{
          fontSize: 12,
          color: colors.error,
          marginTop: 4,
        }}>
          {error}
        </Text>
      )}
    </View>
  );
};