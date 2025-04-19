import React, { createContext, useContext, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { UserRow } from "../src/types/supabase";

// Definizione del tipo per i dati utente estesi
export type ExtendedUser = UserRow & {
  email?: string;
};

// Definizione del tipo per il contesto di autenticazione
interface AuthContextType {
  user: ExtendedUser | User | null;
  setAuth: (user: User | null) => void;
  setUserData: (userData: ExtendedUser | null) => void;
}

// Creazione del contesto con un valore predefinito
const AuthContext = createContext<AuthContextType>({
  user: null,
  setAuth: () => {},
  setUserData: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | User | null>(null);

  const setAuth = (authUser: User | null): void => {
    setUser(authUser);
  };

  const setUserData = (userData: ExtendedUser | null): void => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, setAuth, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => useContext(AuthContext);
