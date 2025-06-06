import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState } from "@/types/auth";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: [],
      isAuthenticated: false,
      register: (userData) => {
        const users = get().users;
        const exists = users.some((user) => user.email === userData.email);

        if (exists) return false;

        const newUser = {
          ...userData,
          id: Math.random().toString(36).slice(2),
        };

        set((state) => ({
          users: [...state.users, newUser],
        }));
        return true;
      },
      login: (email, password) => {
        const user = get().users.find(
          (u) => u.email === email && u.password === password
        );

        if (user) {
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    }
  )
);
