import type { Metadata } from "next";
import "./globals.css";
import { FitnessProvider } from "@/components/providers/fitness-provider";
import { OjasProvider } from "@/components/providers/ojas-provider";
import { MusicProvider } from "@/components/providers/music-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { I18nProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Ojas AI | India-First AI Fitness Operating System",
  description: "India's first AI human fitness operating system. Movement, nutrition, recovery, hostel mode, budget coach, and multilingual AI coaching.",
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
                <OjasProvider>
                  <I18nProvider>
                    <MusicProvider>{children}</MusicProvider>
                  </I18nProvider>
                </OjasProvider>
              </FitnessProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
