import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configure",
};

export default function ConfigureLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
