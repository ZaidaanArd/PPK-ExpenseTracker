import type { Metadata } from "next";
import "./globals.css";
import { Geist, Raleway } from "next/font/google";
import { cn } from "@/lib/utils";
import { cookies } from "next/headers";

const ralewayHeading = Raleway({subsets:['latin'],variable:'--font-heading'});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "PPK Expense Tracker",
  description: "Aplikasi pencatatan keuangan pribadi",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const theme = (await cookies()).get("ppk_theme")?.value;
  return (
    <html lang="id" className={cn("font-sans", geist.variable, ralewayHeading.variable, theme === "dark" && "dark")}>
      <body>{children}</body>
    </html>
  );
}
