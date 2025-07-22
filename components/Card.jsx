import { View, Text, TouchableOpacity } from 'react-native';

export const Card = ({ title, subtitle, onPress, children }) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      {title && (
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: colors.textPrimary,
          marginBottom: subtitle ? 4 : 8,
        }}>
          {title}
        </Text>
      )}
      {subtitle && (
        <Text style={{
          fontSize: 14,
          color: colors.textSecondary,
          marginBottom: 8,
        }}>
          {subtitle}
        </Text>
      )}
      {children}
    </TouchableOpacity>
  );
};