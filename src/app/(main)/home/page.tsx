import { BsListNested } from "react-icons/bs";
import { FaCogs } from "react-icons/fa";
import { LuInfo } from "react-icons/lu";

export default function Home() {
  return (
    <div className="p-4 flex flex-col w-full h-full gap-6">
      <div className="px-10 py-20 gap-9 text-lg bg-white/5 rounded-4xl flex items-center">
        <BsListNested className="shrink-0" size={50} />
        NxServer will listen for your notifications and present them for your
        configured clients. you can change this any time using the app
      </div>
      <div className="bg-white/5 gap-7 p-10 flex items-center rounded-3xl">
        <FaCogs className="shrink-0" size={50} />
        To configure scan the QR code in the configure tab then view notifications
        in notifications tab
      </div>
      <div className="bg-white/5 gap-7 p-10 flex items-center rounded-3xl">
        <LuInfo className="shrink-0" size={50} />
        Contact us for any problems
      </div>
    </div>
  );
}
