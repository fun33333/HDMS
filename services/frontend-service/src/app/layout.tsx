import type { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "../lib/auth";
import { Layout } from "../components/layout/layout";
import { Toast } from "../components/ui/Toast";

export const metadata: Metadata = {
  title: "Help Desk System",
  description: "Professional Help Desk Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        suppressHydrationWarning={true}
        style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        <AuthProvider>
          <Layout>
            {children}
          </Layout>
          <Toast />
        </AuthProvider>
      </body>
    </html>
  );
}
