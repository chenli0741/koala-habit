import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Koala Habit Parent Console",
  description: "Parent planning and confirmation console for Koala Habit."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
