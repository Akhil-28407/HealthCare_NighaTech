import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isImpersonating: boolean;
  originalAdminSession: { user: User | null; accessToken: string | null; refreshToken: string | null } | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  updateUser: (user: User) => void;
  startImpersonating: (user: User, accessToken: string, refreshToken: string) => void;
  stopImpersonating: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isImpersonating: false,
      originalAdminSession: null,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      setTokens: (accessToken: string, refreshToken: string) =>
        set({ accessToken, refreshToken }),
      updateUser: (user) => set({ user }),
      startImpersonating: (targetUser, targetAccess, targetRefresh) => {
        const currentSession = {
          user: get().user,
          accessToken: get().accessToken,
          refreshToken: get().refreshToken,
        };
        set({
          originalAdminSession: currentSession,
          user: targetUser,
          accessToken: targetAccess,
          refreshToken: targetRefresh,
          isImpersonating: true,
        });
      },
      stopImpersonating: () => {
        const adminSession = get().originalAdminSession;
        if (adminSession) {
          set({
            user: adminSession.user,
            accessToken: adminSession.accessToken,
            refreshToken: adminSession.refreshToken,
            isImpersonating: false,
            originalAdminSession: null,
          });
        }
      },
      logout: () =>
        set({ 
          user: null, 
          accessToken: null, 
          refreshToken: null, 
          isAuthenticated: false,
          isImpersonating: false,
          originalAdminSession: null
        }),
    }),
    { name: 'healthcare-auth' },
  ),
);
