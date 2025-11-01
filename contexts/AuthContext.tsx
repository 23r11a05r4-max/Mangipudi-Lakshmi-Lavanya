import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

type UserWithPassword = User & { passwordHash: string };

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id' | 'credits'>, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUserData: Partial<User>) => void;
  updateCredits: (amount: number) => void;
  showToast: (message: string) => void;
}

// Fix: Provided a complete default value for the context to match AuthContextType, resolving a TypeScript error.
export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUser: () => {},
  updateCredits: () => {},
  showToast: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
  showToast: (message: string) => void;
}

const mockHash = (s: string) => `hashed_${s}_hashed`;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, showToast }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loggedInUserJson = localStorage.getItem('truth-tally-currentUser');
    if (loggedInUserJson) {
      setUser(JSON.parse(loggedInUserJson));
    }
  }, []);

  const updateUser = (updatedUserData: Partial<User>) => {
    if(!user) return;
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    localStorage.setItem('truth-tally-currentUser', JSON.stringify(updatedUser));

    // Also update the full user list in storage
    const usersJson = localStorage.getItem('truth-tally-users');
    let users: UserWithPassword[] = usersJson ? JSON.parse(usersJson) : [];
    const userIndex = users.findIndex(u => u.id === user.id);
    if(userIndex > -1) {
        const fullUser = users[userIndex];
        users[userIndex] = { ...fullUser, ...updatedUser };
        localStorage.setItem('truth-tally-users', JSON.stringify(users));
    }
  };
  
  const updateCredits = (amount: number) => {
      if(!user) return;
      updateUser({ credits: user.credits + amount });
  };


  const login = async (username: string, password: string): Promise<void> => {
    const usersJson = localStorage.getItem('truth-tally-users');
    const users: UserWithPassword[] = usersJson ? JSON.parse(usersJson) : [];
    
    const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (foundUser && foundUser.passwordHash === mockHash(password)) {
      const { passwordHash, ...userToStore } = foundUser;
      setUser(userToStore);
      localStorage.setItem('truth-tally-currentUser', JSON.stringify(userToStore));
      showToast(`Welcome back, ${userToStore.username}!`);
    } else {
      throw new Error('Invalid username or password.');
    }
  };

  const register = async (userData: Omit<User, 'id' | 'credits'>, password: string): Promise<void> => {
    const usersJson = localStorage.getItem('truth-tally-users');
    const users: UserWithPassword[] = usersJson ? JSON.parse(usersJson) : [];
    
    if (users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
        throw new Error('Username is already taken.');
    }

    const newUser: UserWithPassword = {
        ...userData,
        id: new Date().toISOString(),
        credits: 0,
        passwordHash: mockHash(password),
    };

    users.push(newUser);
    localStorage.setItem('truth-tally-users', JSON.stringify(users));

    const { passwordHash, ...userToStore } = newUser;
    setUser(userToStore);
    localStorage.setItem('truth-tally-currentUser', JSON.stringify(userToStore));
    showToast(`Welcome, ${userToStore.username}! Account created.`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('truth-tally-currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, updateCredits, showToast }}>
      {children}
    </AuthContext.Provider>
  );
};