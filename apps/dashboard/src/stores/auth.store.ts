import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, tokenStore } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  tenant_id: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  is_demo: boolean;
  wa_configured: boolean;
  onboarding_done: boolean;
  onboarding_step: number;
  phone_number_id?: string;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadMe: () => Promise<void>;
  setTenant: (t: Tenant) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post<{
            success: boolean;
            data: { access_token: string; refresh_token: string; user: User; tenant: Tenant };
          }>("/api/auth/login", { email, password });

          tokenStore.set(res.data.access_token);
          tokenStore.setRefresh(res.data.refresh_token);

          set({
            user: res.data.user,
            tenant: res.data.tenant,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        const refresh_token = tokenStore.getRefresh();
        if (refresh_token) {
          await api.post("/api/auth/logout", { refresh_token }).catch(() => {});
        }
        tokenStore.clear();
        set({ user: null, tenant: null, isAuthenticated: false });
      },

      loadMe: async () => {
        if (!tokenStore.get()) return;
        try {
          const res = await api.get<{ success: boolean; data: { tenant: Tenant } & User }>(
            "/api/auth/me"
          );
          set({
            user: {
              id: res.data.id,
              email: res.data.email,
              name: res.data.name,
              avatar_url: res.data.avatar_url,
              tenant_id: res.data.tenant_id,
            },
            tenant: res.data.tenant,
            isAuthenticated: true,
          });
        } catch {
          tokenStore.clear();
          set({ user: null, tenant: null, isAuthenticated: false });
        }
      },

      setTenant: (t) => set({ tenant: t }),
    }),
    {
      name: "indialeads-auth",
      partialize: (state) => ({ user: state.user, tenant: state.tenant, isAuthenticated: state.isAuthenticated }),
    }
  )
);
