import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform } from 'react-native';


// --- Floating Label Input with animation like Google's Material Textfields ---
const FloatingLabelInput = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  autoCapitalize = "none",
  autoCorrect = false,
  placeholder = '',
  editable,
  showPassword,
  onToggleVisibility,
}) => {
  const isFocused = useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(isFocused, {
      toValue: value.length > 0 ? 1 : 0,
      duration: 0,
      useNativeDriver: false,
    }).start();
  }, []);

  const handleFocus = () => {
    Animated.timing(isFocused, {
      toValue: 1,
      duration: 170,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    if (!value) {
      Animated.timing(isFocused, {
        toValue: 0,
        duration: 170,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelStyle = {
    position: 'absolute',
    left: 15,
    top: isFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -8],
    }),
    fontSize: isFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 13],
    }),
    color: isFocused.interpolate({
      inputRange: [0, 1],
      outputRange: ['#8b98b9', '#3547a8'],
    }),
    backgroundColor: '#f7fafc',
    paddingHorizontal: 4,
    zIndex: 2,
    fontWeight: 'bold'
  };

  return (
    <View style={local.inputContainer}>
      <Animated.Text style={labelStyle}>
        {label}
      </Animated.Text>
      <TextInput
        style={[local.input, showPassword !== undefined && { paddingRight: 44 }]}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !showPassword}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={editable}
        placeholder=""
        selectionColor="#525ad6"
      />
      {typeof showPassword === 'boolean' && onToggleVisibility && (
        <TouchableOpacity
          style={local.visibilityToggle}
          onPress={onToggleVisibility}
        >
          <MaterialIcons
            name={showPassword ? "visibility-off" : "visibility"}
            size={22}
            color="#8b98b9"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, setError } = useAuth();

  const handleLogin = async () => {
    setError(null);
    if (!username || !password) {
      setError({ message: 'Please enter both username and password' });
      return;
    }
    try {
      const user = await login(username, password);
      switch (user.role) {
        case 'Student':
          router.replace('/(student)/home');
          break;
        case 'Lecturer':
          router.replace('/(lecturer)/home');
          break;
        case 'Invigilator':
          router.replace('/(invigilator)/home');
          break;
        case 'Admin':
          router.replace('/(admin)/home');
          break;
        default:
          setError({ message: 'Your role is not recognized' });
      }
    } catch {
      // error handled in context
    }
  };

  const renderError = () => {
    if (!error) return null;
    return (
      <View style={local.errorContainer}>
        <Text style={local.errorText}>{error.message}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
    <ScrollView
      contentContainerStyle={local.container}
      keyboardShouldPersistTaps="handled"
      bounces={false}
    >
      <View style={local.backgroundShape} pointerEvents="none" />
      <Stack.Screen
        options={{
          title: 'Login',
          headerBackVisible: false,
        }}
      />
      <View>
        <View style={local.logoContainer}>
          <MaterialIcons name="school" size={62} color="#3547a8" />
          <Text style={local.title}>Online Grading Portal</Text>
          <Text style={local.subtitle}>Academic Excellence, Digitally</Text>
        </View>
        {renderError()}
        <FloatingLabelInput
          label="username"
          value={username}
          onChangeText={setUsername}
          editable={!isLoading}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <FloatingLabelInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
          showPassword={showPassword}
          onToggleVisibility={() => setShowPassword((v) => !v)}
        />
        <Pressable
          style={({ pressed }) => [
            local.button,
            isLoading && local.buttonDisabled,
            pressed && local.buttonPressed,
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={local.buttonText}>Login</Text>
          )}
        </Pressable>
        <TouchableOpacity style={local.forgotLink}>
          <Text style={local.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/contact')}>
        <Text style={local.footerText}>
        Need help? Contact{' '}
        <Text style={{ color: "#3547a8", fontWeight: '700' }}>support</Text>
        </Text>
    </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const local = StyleSheet.create({
  container: {
    minHeight: '100%',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f7fa',
    padding: 0,
    position: 'relative',
  },
  backgroundShape: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    backgroundColor: 'white',
    // Simulate diagonal dark blue overlay
    borderTopRightRadius: 350,
    backgroundColor: '#f4f7fa',
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    overflow: 'hidden',
  },
  card: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#f7fafc',
    borderRadius: 17,
    padding: 28,
    marginTop: 44,
    shadowColor: '#2d3568',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 27,
    fontWeight: '700',
    marginTop: 16,
    letterSpacing: 0.2,
    color: '#28367a',
    textAlign: 'center',
  },
  subtitle: {
    color: '#a092ce',
    fontSize: 13.5,
    marginTop: 6,
    fontWeight: '500',
    letterSpacing: 0.25,
  },
  inputContainer: {
    marginBottom: 17,
    justifyContent: 'center',
    position: 'relative',
  },
  input: {
    height: 53,
    fontSize: 16,
    borderWidth: 1.6,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 17,
    backgroundColor: '#f3f5fb',
    color: '#29325a',
    borderColor: '#dbe6fd',
    shadowColor: '#29477b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.09,
    shadowRadius: 2,
    zIndex: 1,
  },
  visibilityToggle: {
    position: 'absolute',
    right: 10,
    top: 16,
    padding: 5,
    zIndex: 5,
  },
  button: {
    backgroundColor: '#3547a8',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 13,
    elevation: 2,
    shadowColor: '#3a468b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonPressed: {
    backgroundColor: '#394ccb',
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.25,
  },
  buttonDisabled: {
    backgroundColor: '#c8d6fa',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1.0,
  },
  forgotLink: {
    alignItems: 'flex-end',
    marginTop: 12,
    marginRight: 4,
    marginBottom: 19,
  },
  forgotText: {
    color: '#9473e6',
    fontWeight: 'bold',
    fontSize: 13.5,
  },
  errorContainer: {
    backgroundColor: '#fddede',
    padding: 11,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#d13a46',
  },
  errorText: {
    color: '#b91d22',
    fontSize: 14,
  },
  footer: {
    marginTop: 25,
    alignItems: 'center',
  },
  footerText: {
    color: '#929bb3',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LoginPage;
