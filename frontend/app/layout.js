"use client";
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Teacher Dashboard",
  description: "Dashboard for teachers to manage their classes and students.",
};

import Header from "./dashboard/components/Header";
import { getServerSession } from "next-auth/next"; // Note: Import from next-auth/next
import { authOptions } from "./api/auth/[...nextauth]/route"; // Ensure you export authOptions

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions) || {}; // Ensure session is defined


  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Providers session={session}>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
