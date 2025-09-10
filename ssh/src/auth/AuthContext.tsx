import { createContext } from 'react';

export type User = { id: string; name: string; email: string } | null;
export type AuthCtx = {
  user: User;
  reload: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthCtx | null>(null);
