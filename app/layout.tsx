import type { Metadata } from "next";
import "./globals.css";
import { FitnessProvider } from "@/components/providers/fitness-provider";
import { MusicProvider } from "@/components/providers/music-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { ToastProvider } from "@/providers/toast-provider";

export const metadata: Metadata = {
  title: "Project Titan | AI Fitness Operating System",
  description: "The world's first AI human performance OS. Complete posture tracking, food recognition scanning, and adaptive physiology modeling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)] transition-colors duration-250">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <FitnessProvider>
                <MusicProvider>{children}</MusicProvider>
              </FitnessProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
