"use client";

import { useUser, Show, SignInButton } from "@clerk/nextjs";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { FaUserCog, FaCircleNotch } from "react-icons/fa";
import { IoMdRemoveCircle } from "react-icons/io";
import Image from "next/image";

import Loader from "@/app/components/Loader";

type UserData = {
  fullName: string;
  profileImage: string;
};

export default function Configure() {
  const { user, isLoaded, isSignedIn } = useUser();
  // const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [unsubscribeLoading, setUnsubscribeLoading] = useState(false);
  const [subscription, setSubscription] = useState<string[] | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<UserData | null>(
    null,
  );
  const [polling, setPolling] = useState(false);
  const [errorUnsubscribing, setErrorUnsubscribing] = useState<string | null>(
    null,
  );

  // useEffect(() => {
  //   if (isLoaded) setLoading(false);
  // }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded) return setLoadingData(false);
    else if (!isSignedIn) {
      setLoadingData(false);
      return document.getElementById("signIn")?.click();
    }

    const userSignedIn = user;
    const subscriptionList = userSignedIn?.publicMetadata
      ?.subscription as string[];

    setSubscription(subscriptionList);

    let pollerIntervalId: NodeJS.Timeout;

    if (!subscription?.length || !subscription) {
      setLoadingData(false);
      pollerIntervalId = setInterval(async () => {
        if (polling) return;

        setPolling(true);
        await user.reload();
        setPolling(false);
      }, 15000);
    } else if (subscriptionData) setLoadingData(false);
    else fetchSubscriptionData();

    return () => clearInterval(pollerIntervalId);
  }, [isLoaded, isSignedIn, user, polling, subscription, subscriptionData]);

  // useEffect(() => {
  //   if (
  //     isSignedIn &&
  //     isLoaded &&
  //     subscription &&
  //     subscription?.length &&
  //     !subscriptionData
  //   ) {
  //     fetchSubscriptionData();
  //   } else setLoadingData(false);
  // }, [isLoaded, isSignedIn, subscription, subscriptionData]);

  const fetchSubscriptionData = async () => {
    setLoadingData(true);
    try {
      const res = await (await fetch("/api/getSubscriptionUserData")).json();
      if (res.status === "success") setSubscriptionData(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      // console.log("done fetching data");
      setLoadingData(false);
    }
  };

  const unsubscribe = async () => {
    setUnsubscribeLoading(true);
    setErrorUnsubscribing(null);
    try {
      const res = await (await fetch("/api/unsubscribe")).json();
      if (res.status === "error") setErrorUnsubscribing(res.message);
      else await user?.reload();
    } catch (error) {
      setErrorUnsubscribing(typeof error === "string" ? error : "");
    } finally {
      setUnsubscribeLoading(false);
    }
  };

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
              Sign in to configure
            </div>
          </Show>

          {!isSignedIn ? null : (
            <>
              {loadingData ? (
                <Loader />
              ) : (
                <Show when="signed-in">
                  {!subscription || !subscription[0]?.length ? (
                    <div className="flex items-center flex-col gap-6 text-gray-400 justify-center w-full h-full">
                      <div>Scan this QR code to access notifications</div>

                      <div className="bg-white p-0 rounded-2xl">
                        <QRCodeSVG
                          value={user?.id || ""}
                          size={280}
                          level="H"
                          className="p-4"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full gap-3 pt-14 text-gray-400 items-center flex-col flex justify-center text-lg">
                      {!subscriptionData ? (
                        <div>
                          Already configured, couldn&lsquo;t get subscription
                          data
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0">
                          <div className="text-gray-500 text-sm //pl-5">
                            You have subscribed to
                          </div>
                          <div className="flex gap-4 p-4 items-center justify-center">
                            <Image
                              alt=""
                              src={subscriptionData?.profileImage}
                              className="rounded-full"
                              width={50}
                              height={50}
                            />
                            <div className="text-white text-lg">
                              {subscriptionData.fullName}
                            </div>
                          </div>
                        </div>
                      )}
                      {errorUnsubscribing ? (
                        <div>{errorUnsubscribing}</div>
                      ) : null}
                      <div
                        onClick={unsubscribe}
                        className={`px-6 p-2 gap-2 items-center ${unsubscribeLoading ? "hidden" : ""} flex text-red-400 rounded-full bg-white/5 hover:bg-white/10 select-none`}
                      >
                        {unsubscribeLoading ? (
                          <FaCircleNotch
                            size={23}
                            className="//animate-bounce animate-spin"
                          />
                        ) : (
                          <IoMdRemoveCircle size={23} />
                        )}
                        Unsubscribe
                      </div>
                    </div>
                  )}
                </Show>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
