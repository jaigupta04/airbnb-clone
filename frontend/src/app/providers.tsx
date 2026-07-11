"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Header from "@/components/Header";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Header />
          <main className="flex-1">{children}</main>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}