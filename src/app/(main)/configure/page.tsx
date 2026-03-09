"use client";

import { useUser, Show, SignInButton } from "@clerk/nextjs";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { FaUserCog, FaCogs } from "react-icons/fa";
import Image from "next/image";

import Loader from "@/app/components/Loader";

type UserData = {
  fullName: string;
  profileImage: string;
};

export default function Configure() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [unsubscribeLoading, setUnsubscribeLoading] = useState(false);
  const [subscription, setSubscription] = useState<string[] | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<UserData | null>(
    null,
  );
  const [polling, setPolling] = useState(false);
  const [errorUnsubscribing, setErrorUnsubscribing] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (isLoaded) setLoading(false);
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded && !isSignedIn && !loading)
      return document.getElementById("signIn")?.click();

    const userSignedIn = user;
    const subscriptionList = userSignedIn?.publicMetadata
      ?.subscription as string[];

    setSubscription(subscriptionList);

    let pollerIntervalId: NodeJS.Timeout;

    if (isSignedIn && isLoaded && (!subscription?.length || !subscription)) {
      pollerIntervalId = setInterval(async () => {
        if (polling) return;

        setPolling(true);
        await user.reload();
        setPolling(false);
      }, 10000);
    }

    return () => clearInterval(pollerIntervalId);
  }, [isLoaded, isSignedIn, user, polling, subscription, loading]);

  useEffect(() => {
    if (
      isSignedIn &&
      isLoaded &&
      subscription &&
      subscription?.length &&
      !subscriptionData
    ) {
      fetchSubscriptionData();
    }
  }, [isLoaded, isSignedIn, subscription, subscriptionData]);

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
      {loading || loadingData ? (
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

          <Show when="signed-in">
            {subscription &&
            subscription[0]?.length /* new */ &&
            subscriptionData ? (
              <div className="w-full gap-3 pt-14 text-gray-400 items-center flex-col flex justify-center text-lg">
                {
                  unsubscribeLoading ? (
                    <Loader />
                  ) : errorUnsubscribing ? (
                    <div>{errorUnsubscribing}</div>
                  ) : (
                    /* subscriptionData ? */ <div className="flex flex-col gap-0">
                      <div className="text-gray-500 text-sm pl-5">
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
                  ) /* : (
                  <div>
                    Already configured, couldn&lsquo;t get subscription data
                  </div>
                ) */
                }
                <div
                  onClick={unsubscribe}
                  className={`px-6 p-2 gap-2 items-center ${unsubscribeLoading ? "hidden" : ""} flex rounded-full text-white bg-white/5 hover:bg-white/10 select-none`}
                >
                  <FaCogs size={23} />
                  Reconfigure
                </div>
              </div>
            ) : (
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
            )}
          </Show>
        </>
      )}
    </div>
  );
}
