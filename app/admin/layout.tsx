import type { Metadata } from "next";
import { AdminAuthProvider } from "@/providers/admin-auth-provider";
import { AdminShell } from "@/components/admin/shell";

export const metadata: Metadata = {
  title: "Titan Admin | Enterprise Control Center",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
