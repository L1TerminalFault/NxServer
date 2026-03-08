"use client";

import { useEffect, useState } from "react";
import { Show, SignInButton, useUser } from "@clerk/nextjs";
import { FaUserCog } from "react-icons/fa";
import { RiListSettingsFill } from "react-icons/ri";
import { TbPlaylistX } from "react-icons/tb";

import { Message } from "@/lib/types";

import Loader from "@/app/components/Loader";

export default function Notification() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [errorMessages, setErrorMessages] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) document.getElementById("signIn")?.click();
  }, [isLoaded, isSignedIn]);

  const fetchMessages = async (channelId: string) => {
    setLoadingMessages(true);

    try {
      const dataRet = await (
        await fetch(
          `/api/notifications/getNotifications?channelId=${channelId}`,
        )
      ).json();
      if (dataRet.status === "success") setMessages(dataRet.messages);
      else setErrorMessages(dataRet.message);
    } catch (error) {
      setErrorMessages(typeof error == "string" ? error : "");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!isSignedIn && !isLoaded) return;

    const sublist = user?.publicMetadata?.subscription as string[];

    if (!sublist || !sublist[0]?.length) {
      setErrorMessages(
        "You are not subscribed to any channel yet go to configure tab to do so",
      );
      setLoadingMessages(false);
      return;
    }

    fetchMessages(sublist[0]);
  }, [isSignedIn, isLoaded, user]);

  return (
    <div className="flex w-full h-full">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <div id="signIn"></div>
        </SignInButton>

        <div className="text-lg text-gray-500 flex-col gap-4 p-12 w-full h-full flex items-center justify-center">
          <FaUserCog className="size-40" />
          Sign in to access notifications
        </div>
      </Show>

      <Show when="signed-in">
        {loadingMessages || !isLoaded ? (
          <Loader />
        ) : errorMessages ? (
          <div className="w-full px-10 flex-col gap-8 text-center text-gray-400 flex items-center justify-center text-lg">
            <RiListSettingsFill className="size-26" />
            {errorMessages}
          </div>
        ) : !messages?.length ? (
          <div className="w-full pt-14 text-gray-400 flex-col gap-8 flex items-center justify-center text-lg">
            <TbPlaylistX className="size-26" />
            No notifications
          </div>
        ) : (
          <div className="w-full h-full flex flex-col gap-4 px-4 py-2 scrollbar-hidden">
            {messages?.map((message) => (
              <div
                key={message._id}
                className={`${Math.abs(Date.now() - parseInt(message.time)) <= 60000 ? "bg-white/10 border border-gray-700/80" : "bg-[#ffffff11]"} flex justify-between gap-2 flex-row  p-1.5 rounded-2xl`}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="font-bold px-3 pt-1">{message.title}</div>
                  <div className="text-sm text-gray-300 border-gray-700/45 rounded-2xl bg-[#ffffff0a] border px-2.5 py-1.5">
                    {message.message}
                  </div>
                </div>

                <div className="text-xs flex flex-col gap-1 p-1 justify-end text-nowrap">
                  <div className="text-gray-400">
                    {Math.abs(Date.now() - parseInt(message.time)) <= 60000 ? (
                      <span className="text-white font-bold">Just now</span>
                    ) : (
                      new Date(parseInt(message.time)).toLocaleString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    )}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {new Date(parseInt(message.time)).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Show>
    </div>
  );
}
