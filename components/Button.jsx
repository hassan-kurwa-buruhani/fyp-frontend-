import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false, 
  loading = false,
  icon,
  style 
}) => {
  const variants = {
    primary: {
      backgroundColor: colors.primary,
      textColor: colors.surface,
    },
    secondary: {
      backgroundColor: colors.secondary,
      textColor: colors.surface,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
      textColor: colors.primary,
    },
    text: {
      backgroundColor: 'transparent',
      textColor: colors.primary,
    },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          height: 48,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          paddingHorizontal: 16,
          opacity: disabled ? 0.6 : 1,
          ...variants[variant],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variants[variant].textColor} />
      ) : (
        <>
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text style={{
            color: variants[variant].textColor,
            fontSize: 16,
            fontWeight: '500',
          }}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};