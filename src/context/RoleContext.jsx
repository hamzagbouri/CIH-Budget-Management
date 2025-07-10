import { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

const RoleContext = createContext();

export function RoleProvider({ children }) {
  const { user } = useAuth();
  const role = user?.role || 'user';
  return (
    <RoleContext.Provider value={role}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
} 