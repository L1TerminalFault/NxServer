"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import TitleBar from "@/app/components/TitleBar";
import NavBar from "@/app/components/NavBar";

export default function MainLayout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
  return (
    <ClerkProvider
      afterSignOutUrl="/home"
      // signInForceRedirectUrl={"/home"}
      appearance={{
        theme: dark,
      }}
    >
      <TitleBar />
      {/* <ClerkLoaded> */}
      <div className="min-h-screen flex w-full bg-gray-900/10">
        <div className="py-18 pb-24 flex-1 flex w-full">{children}</div>
      </div>
      {/* </ClerkLoaded> */}
      <NavBar />
    </ClerkProvider>
  );
}
