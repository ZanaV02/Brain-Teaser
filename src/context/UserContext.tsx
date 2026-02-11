import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserContextType {
  username: string | null;
  login: (name: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- OVO JE VERZIJA KOJA PAMTI KORISNIKA ---
  useEffect(() => {
    const loadSavedUser = async () => {
      try {
        // Pokušaj da nađeš sačuvano ime
        const savedName = await AsyncStorage.getItem('@user_name');
        
        // Ako ime postoji, postavi ga u state (preskačemo Login)
        if (savedName) {
          setUsername(savedName);
        }
      } catch (error) {
        console.error("Greška pri učitavanju imena:", error);
      } finally {
        // Učitavanje završeno
        setIsLoading(false);
      }
    };

    loadSavedUser();
  }, []);
  // -------------------------------------------

  const login = async (name: string) => {
    try {
      await AsyncStorage.setItem('@user_name', name);
      setUsername(name);
    } catch (error) {
      console.error("Greška pri snimanju imena:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@user_name');
      setUsername(null);
    } catch (error) {
      console.error("Greška pri brisanju imena:", error);
    }
  };

  return (
    <UserContext.Provider value={{ username, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser se mora koristiti unutar UserProvider-a");
  }
  return context;
};