import React, { createContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the types for the user and context
interface User {
  id: string;
  email: string;
  // Add other user properties as needed
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string) => Promise<any>;
  Url: string;
}

// Create context with default values
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const Url = 'https://smartfield-api.onrender.com/api';

  const login = async (email: string, password: string) => {
    const response = await axios.post(`${Url}/auth/login`, { email, password });
    setCurrentUser(response.data.user);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  };

  const register = async (email: string, password: string) => {
    const response = await axios.post(`${Url}/auth/register`, { email, password });
    setCurrentUser(response.data.user);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  };

  useEffect(() => {
    const getUser = async () => {
      const storedData = await AsyncStorage.getItem('user');
      const user = storedData ? JSON.parse(storedData) : null;
      setCurrentUser(user);
    };
    if (!currentUser) {
      getUser();
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, register, Url }}>
      {children}
    </AuthContext.Provider>
  );
};
