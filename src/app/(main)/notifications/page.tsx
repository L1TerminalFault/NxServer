"use client";

import { useEffect, useState } from "react";
import { Show, SignInButton, useUser } from "@clerk/nextjs";
import { /* FaCircleNotch, */ FaUserCog } from "react-icons/fa";
import { RiListSettingsFill } from "react-icons/ri";
import { TbPlaylistX } from "react-icons/tb";
import { RiRefreshLine } from "react-icons/ri";

import { Message } from "@/lib/types";
import Loader from "@/app/components/Loader";

const POLLING_INTERVAL = 10000;

function justNow(time: string) {
  return Math.abs(Date.now() - parseInt(time)) <= 60000;
}

export default function Notification() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [sublist, setSublist] = useState<string[] | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  const fetchBase = async (
    channelId: string | null,
    errorLog: boolean = true,
  ) => {
    if (!channelId) return;

    try {
      const dataRet = await (
        await fetch(
          `/api/notifications/getNotifications?channelId=${channelId}`,
        )
      ).json();
      if (dataRet.status === "success") setMessages(dataRet.messages);
      else if (errorLog) setErrorMessages(dataRet.message);
    } catch (error) {
      if (errorLog) setErrorMessages(typeof error == "string" ? error : "");
    }
  };

  const fetchMessages = async (channelId: string | null) => {
    setLoadingMessages(true);
    await fetchBase(channelId);
    setLoadingMessages(false);
  };

  const refresh = async () => {
    setRefreshing(true);
    if (polling) return; // console.log("refresh cancelled because of lock poll");
    await fetchBase(sublist ? sublist[0] : null);
    setRefreshing(false);
  };

  const poll = async () => {
    if (refreshing || polling) return; // console.log("skipping poll because lock is held");
    setPolling(true);
    await fetchBase(sublist ? sublist[0] : null);
    setPolling(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (!isLoaded)
      return; // setLoadingMessages(false)
    else if (!isSignedIn) {
      setLoadingMessages(false);
      return document.getElementById("signIn")?.click();
    }

    const sublistLocal: string[] | null = user?.publicMetadata
      ?.subscription as string[];
    setSublist(sublistLocal);

    if (!sublistLocal || !sublistLocal[0]?.length) {
      setSubscribed(false);
      return setLoadingMessages(false);
    } else {
      setSubscribed(true);
      fetchMessages(sublistLocal ? sublistLocal[0] : null);

      const timer = setInterval(() => {
        poll();
      }, POLLING_INTERVAL);

      return () => clearInterval(timer);
    }
  }, [isLoaded, isSignedIn, user]);

  // if (isLoaded) {
  //   if (!isSignedIn) document.getElementById("signIn")?.click();
  //   else setSublist(user?.publicMetadata?.subscription as string[]);
  // }
  // }, [isLoaded, isSignedIn, user /* , user?.publicMetadata?.subscription */]);

  // useEffect(() => {
  //   if (!sublist || !sublist[0]?.length) return;
  //
  //   const timer = setInterval(() => {
  //     poll();
  //   }, POLLING_INTERVAL);
  //
  //   return () => clearInterval(timer);
  // }, [polling, refreshing, sublist]);

  // useEffect(() => {
  //   if (!isSignedIn && !isLoaded) return;
  //
  //   if (!sublist || !sublist[0]?.length) {
  //     setErrorMessages(
  //       "You are not subscribed to any channel yet go to configure tab to do so",
  //     );
  //     setLoadingMessages(false);
  //     return;
  //   } else setErrorMessages(null);
  //
  //   fetchMessages(sublist[0]);
  // }, [isSignedIn, isLoaded, user, sublist]);

  return (
    <div className="flex w-full h-full">
      {!isLoaded ? (
        <Loader />
      ) : (
        <>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <div id="signIn"></div>
            </SignInButton>

            <div className="text-lg text-gray-500 flex-col gap-4 p-12 w-full h-full flex items-center justify-center">
              <FaUserCog className="size-40" />
              Sign in to access notifications
            </div>
          </Show>

          {!isSignedIn ? null : loadingMessages ? (
            <Loader />
          ) : (
            <Show when="signed-in">
              <div
                onClick={refresh}
                className={`${!subscribed ? "hidden" : ""} select-none fixed flex items-center gap-2 z-20 backdrop-blur-xl bottom-22 right-5 text-lg rounded-full shadow-lg shadow-black/30 bg-white/10 hover:bg-white/15 transition-all //py-1.5 p-2 cursor-pointer`}
              >
                <RiRefreshLine // FaCircleNotch
                  className={`${refreshing ? "animate-spin" : ""} rotate-45`}
                  size={20}
                />
              </div>

              {errorMessages ? (
                <div className="flex flex-col w-full justify-center items-center">
                  {errorMessages}
                </div>
              ) : !subscribed ? (
                <div className="w-full px-10 flex-col gap-8 text-center text-gray-400 flex items-center justify-center text-lg">
                  <RiListSettingsFill className="size-26" />
                  <div className="text-center flex flex-col gap-2 items-center">
                    <div>You are not subscribed to any channel yet</div>
                    <div>Go to configure tab to do so</div>
                  </div>
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
                      className={`${justNow(message.time) ? "bg-white/10 border border-gray-700/80" : "bg-[#ffffff11]"} flex justify-between gap-2 flex-row  p-1.5 rounded-2xl`}
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="font-bold px-3 pt-1">
                          {message.title}
                        </div>
                        <div className="text-sm text-gray-300 border-gray-700/45 rounded-2xl bg-[#ffffff0a] border px-2.5 py-1.5">
                          {message.message}
                        </div>
                      </div>

                      <div className="text-xs flex flex-col gap-1 p-1 justify-end text-nowrap">
                        <div className="text-gray-400">
                          {justNow(message.time) ? (
                            <span className="text-white font-bold">
                              Just now
                            </span>
                          ) : (
                            new Date(parseInt(message.time)).toLocaleString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              },
                            )
                          )}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {new Date(parseInt(message.time)).toLocaleString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Show>
          )}
        </>
      )}
    </div>
  );
}
