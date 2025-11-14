import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quantity Checker",
  description: "Upload a CSV to aggregate product quantities."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-gray-50 text-gray-900 antialiased">
        <div className="mx-auto max-w-5xl px-4 py-10">
          {children}
        </div>
      </body>
    </html>
  );
}


