import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import Toast from 'react-native-toast-message';
import { API_URL } from '@env';
import { toastConfig } from '../app/constants/toastConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = API_URL;

  // Helper function for showing toast
  const showToast = (type, message) => {
    Toast.show({
      type,
      text1: message,
      position: 'bottom',
      visibilityTime: 3000,
      autoHide: true,
    });
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!tokens?.access;
  };

  // Check user role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Initialize auth state from storage
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedTokens = await AsyncStorage.getItem('tokens');
        const storedUser = await AsyncStorage.getItem('user');

        if (storedTokens && storedUser) {
          setTokens(JSON.parse(storedTokens));
          setUser(JSON.parse(storedUser));
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${JSON.parse(storedTokens).access}`;
        }
      } catch (error) {
        console.error('Failed to load auth data:', error);
        showToast('error', 'Failed to load your session data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
  
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw { 
          message: 'Please enable location services to continue',
          type: 'permission'
        };
      }
  
      let location;
      try {
        location = await Location.getCurrentPositionAsync({});
      } catch (locationError) {
        console.warn('Location error:', locationError);
        throw {
          message: 'Could not determine your location. Please try again.',
          type: 'location'
        };
      }
  
      const { latitude, longitude } = location.coords;
      const deviceId = Device.osBuildId || 'unknown';
  
      const response = await axios.post(`${baseUrl}/login/`, {
        email,  // Changed from username to email
        password,
        device_id: deviceId,
        latitude: latitude.toString(),
        longitude: longitude.toString()
      }).catch(error => {
        if (error.response && error.response.data) {
          // Handle field-specific errors
          if (error.response.data.email) {
            throw {
              message: error.response.data.email.join(', '),
              type: 'email',
              details: error.response.data
            };
          }
          if (error.response.data.password) {
            throw {
              message: error.response.data.password.join(', '),
              type: 'password',
              details: error.response.data
            };
          }
          if (error.response.data.device_id) {
            throw {
              message: error.response.data.device_id.join(', '),
              type: 'device',
              details: error.response.data
            };
          }
          if (error.response.data.location) {
            throw {
              message: error.response.data.location.join(', '),
              type: 'location',
              details: error.response.data
            };
          }
          
          // Handle non-field errors
          if (error.response.data.detail) {
            throw {
              message: error.response.data.detail,
              type: 'backend',
              details: error.response.data
            };
          }
        }
        throw {
          message: 'Network error. Please check your connection.',
          type: 'network'
        };
      });
  
      const { refresh, access, ...userData } = response.data;
      const authTokens = { refresh, access };
  
      await AsyncStorage.multiSet([
        ['tokens', JSON.stringify(authTokens)],
        ['user', JSON.stringify(userData)]
      ]);
  
      setTokens(authTokens);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      showToast('success', `Welcome back, ${userData.first_name || userData.email.split('@')[0]}!`);
  
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      setError(error);
      
      // More specific error messages based on error type
      let toastMessage = error.message || 'Login failed';
      if (error.type === 'email') {
        toastMessage = 'Email error: ' + error.message;
      } else if (error.type === 'password') {
        toastMessage = 'Password error: ' + error.message;
      } else if (error.type === 'device') {
        toastMessage = 'Device error: ' + error.message;
      } else if (error.type === 'location') {
        toastMessage = 'Location error: ' + error.message;
      }
      
      showToast('error', toastMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${baseUrl}/register/`, userData);
      
      showToast('success', `Welcome ${userData.first_name || userData.email.split('@')[0]}! Account created.`);
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data || error.message);
      
      let toastMessage = error.response?.data?.detail || error.message || 'Registration failed';
      if (error.response?.data?.email) {
        toastMessage = 'Email error: ' + error.response.data.email.join(', ');
      }
      
      showToast('error', toastMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (userData) => {
    setIsLoading(true);
    try {
      const { new_password, verify_password, ...profileData } = userData;
      const payload = { ...profileData };

      if (new_password && verify_password) {
        if (new_password !== verify_password) {
          throw new Error('Passwords do not match');
        }
        payload.new_password = new_password;
        payload.verify_password = verify_password;
      }

      const response = await axios.put(`${baseUrl}/profile/${user.id}/`, payload, {
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
        },
      });

      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      showToast('success', `Profile updated successfully, ${updatedUser.first_name || updatedUser.email.split('@')[0]}!`);

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Profile update failed:', error);
      showToast('error', error.response?.data?.detail || error.message || 'Update failed');
      return { 
        success: false, 
        error: error.response?.data || error.message || 'Update failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const name = user?.first_name || user?.email.split('@')[0] || 'User';
      await AsyncStorage.multiRemove(['tokens', 'user']);
      setUser(null);
      setTokens(null);
      delete axios.defaults.headers.common['Authorization'];
      
      showToast('info', `Goodbye ${name}! You've been logged out.`);
    } catch (error) {
      console.error('Logout error:', error);
      showToast('error', 'There was an issue logging out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      if (!tokens?.refresh) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${baseUrl}/token/refresh/`, {
        refresh: tokens.refresh
      });

      const newTokens = {
        access: response.data.access,
        refresh: tokens.refresh
      };

      await AsyncStorage.setItem('tokens', JSON.stringify(newTokens));
      setTokens(newTokens);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newTokens.access}`;

      return newTokens.access;
    } catch (error) {
      console.error('Token refresh failed:', error);
      showToast('error', 'Session expired. Please log in again.');
      await logout();
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isLoading,
        error,
        isAuthenticated,
        hasRole,
        login,
        register,
        logout,
        refreshToken,
        setError,
        updateUserProfile
      }}
    >
      {children}
      <Toast config={toastConfig} />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};