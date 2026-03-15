"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { SocketProvider } from "@/lib/socket";
import { Sidebar } from "@/components/layout/Sidebar";
import { IS_DEMO } from "@/lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loadMe } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadMe().then(() => {
      const { isAuthenticated: authed } = useAuthStore.getState();
      if (!authed) router.replace("/login");
    });
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SocketProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {IS_DEMO && (
            <div className="demo-banner">
              🚧 DEMO MODE — No real WhatsApp messages will be sent
            </div>
          )}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SocketProvider>
  );
}
