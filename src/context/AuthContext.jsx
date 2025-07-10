import { createContext, useContext, useState } from 'react';
import { users } from '../data/staticData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Default: Yassine (user)
  const [user, setUser] = useState(users[1]);

  const login = (email) => {
    const found = users.find(u => u.email === email);
    if (found) setUser(found);
  };
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 