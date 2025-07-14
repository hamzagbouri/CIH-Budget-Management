import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      if (response.success) {
        setUser(response.user);
        return { success: true, message: response.message, user: response.user };
      } else {
        return { success: false, message: response.message || 'Erreur de connexion' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Erreur de connexion' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear the user state
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Erreur d\'inscription' 
      };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (userId, currentPassword, newPassword) => {
    try {
      setLoading(true);
      const response = await authService.updatePassword(userId, currentPassword, newPassword);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Erreur de mise à jour du mot de passe' 
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updatePassword,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 