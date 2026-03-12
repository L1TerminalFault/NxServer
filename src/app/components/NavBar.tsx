"use client";

import Link from "next/link";
import { SVGProps } from "react";
import { FaCog as Cog, FaAlignLeft as List } from "react-icons/fa";
import { GoHomeFill as Home } from "react-icons/go";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const routes = [
  {
    name: "Home",
    href: "/home",
    icon: (props: SVGProps<SVGSVGElement>) => <Home {...props} />,
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: (props: SVGProps<SVGSVGElement>) => <List {...props} />,
  },
  {
    name: "Configure",
    href: "/configure",
    icon: (props: SVGProps<SVGSVGElement>) => <Cog {...props} />,
  },
  // { name: "Settings", href: "/settings" },
];

export default function NavBar() {
  const pathname = usePathname();

  useEffect(() => {
    const followee = document.getElementById("followee");
    const follower = document.getElementById("follower");
    // setWidth(window.innerWidth)
    // alert(` ${followee?.getBoundingClientRect()?.y}`);

    if (follower) {
      if (follower.style.display !== "inline")
        follower.style.display = "inline";
      follower.style.left = `${followee?.getBoundingClientRect()?.x}px`;
      // if (window.innerWidth > 768)
      //   follower.style.top = `${followee?.getBoundingClientRect()?.y ? followee?.getBoundingClientRect()?.y - 8 : 0}px`;
      // else follower.style.bottom = "20px";
      follower.style.width = `${followee?.clientWidth}px`;
      follower.style.height = `${followee?.clientHeight}px`;
    }
  });

  return (
    <div className="flex pb-6 //max-md: md:px-10 px-10 //max-md: w-full //md:h-full fixed //max-md: bottom-0 //md:top-0 //md:left-0">
      <div
        id="follower"
        className="p-4 hidden bg-white/10 absolute mt-2 transition-all z-10 rounded-full duration-400"
      />
      <div className="flex //max-md: items-center //md:flex-col //md:gap-4 shadow-lg shadow-black/30 p-2 //max-md:p-1 rounded-full //md:h-full //max-md: backdrop-blur-xl w-full //max-md: bg-gray-100/5 //max-md: justify-evenly //md:pt-34">
        {routes.map((route) => (
          <Link
            id={`${route.href.includes(pathname) ? "followee" : ""}`}
            key={route.href}
            href={route.href}
            className={`flex max-md:flex-col items-center justify-center gap-1.5 md:gap-3 text-lg p-1.5 px-6 //px-4 rounded-full ${route.href.includes(pathname) ? "hover:bg-transparent" : "hover:bg-white/5 text-gray-400"} transition-all items-center`}
          >
            <route.icon className="text-2xl" />
            <div className={`flex items-center max-md:text-xs justify-center`}>
              {route.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
