import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "School Management System",
  description: "A system for managing students, parents, and teachers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} w-full`}>
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto p-4">{children}</main>
          <Toaster richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
