import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PPK Expense Tracker",
  description: "Aplikasi pencatatan keuangan pribadi",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
