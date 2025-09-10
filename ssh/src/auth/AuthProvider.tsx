import { useEffect, useState } from 'react';
import { api } from '@/lib/auth.api';
import { AuthContext, type AuthCtx, type User } from './AuthContext';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  const reload = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // 서버/네트워크 오류는 무시하고 클라이언트 상태만 정리
      if (import.meta.env.DEV) console.debug('logout error ignored:', e);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  const value: AuthCtx = { user, reload, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
