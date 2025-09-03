import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await axios.get(`${API_URL}/user/me`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setCurrentUser(response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setCurrentUser(null);
      setLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      if (response.data.access_token) {
        const token = response.data.access_token;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        await fetchCurrentUser();
        return response.data;
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    const response = await axios.post(
      `${API_URL}/auth/register`, 
      userData,
      { withCredentials: true }
    );
    return response.data;
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(
          `${API_URL}/auth/logout`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            withCredentials: true
          }
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setCurrentUser(null);
    }
  };

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    getAuthToken,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
