import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import { API_URL } from '@env';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = API_URL;

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
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

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

      // Update user data in context and storage
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { 
        success: false, 
        error: error.response?.data || error.message || 'Update failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle login
  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);
  
    try {
      // Get device location
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
        username,
        password,
        device_id: deviceId,
        latitude: latitude.toString(),
        longitude: longitude.toString()
      }).catch(error => {
        // Handle backend-specific error responses
        if (error.response && error.response.data) {
          // Handle non_field_errors
          if (error.response.data.non_field_errors) {
            throw {
              message: error.response.data.non_field_errors.join(', '),
              type: 'backend',
              details: error.response.data
            };
          }
          // Handle field-specific errors
          const fieldErrors = Object.entries(error.response.data)
            .filter(([key]) => key !== 'non_field_errors')
            .map(([key, value]) => `${key}: ${value.join(', ')}`);
          
          if (fieldErrors.length > 0) {
            throw {
              message: fieldErrors.join('\n'),
              type: 'validation',
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
  
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle registration
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('YOUR_REGISTER_ENDPOINT', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle logout
  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.multiRemove(['tokens', 'user']);
      setUser(null);
      setTokens(null);
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh access token
  const refreshToken = async () => {
    try {
      if (!tokens?.refresh) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post('http://192.168.0.177:8000/api/token/refresh/', {
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