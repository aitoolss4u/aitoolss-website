import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Studio",
  description: "AIToolss local Admin Studio preview.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
