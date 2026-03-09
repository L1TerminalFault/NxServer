"use client";

import { SignInButton, UserButton, Show } from "@clerk/nextjs";

import { VERSION_STRING } from "@/lib/utils";

export default function TitleBar() {
  return (
    <div className="z-50">
      <div className="w-full shadow-lg shadow-black/30 flex items-center justify-between fixed top-0 p-2 px-5 text-xl border-transparent backdrop-blur-lg transition-all border-b-gray-700/30 border bg-transparent">
        <div className="flex items-center h-12 w-full justify-between">
          <div>
            NxServer{" "}
            <span className="text-sm text-gray-500">v{VERSION_STRING}</span>
          </div>

          <div>
            <Show when="signed-in">
              <UserButton
                showName
                appearance={{
                  elements: {
                    userButtonOuterIdentifier: {
                      color: "gray",
                    },
                  },
                }}
              />
            </Show>

            <Show when="signed-out">
              <SignInButton mode="modal">
                <div className="flex text-base rounded-full p-1 m-2 px-4 bg-white/5 hover:bg-white/10 transition-colors">
                  <div>Sign In</div>
                </div>
              </SignInButton>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
}
