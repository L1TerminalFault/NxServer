import { FaCircleNotch } from "react-icons/fa";

export default function Loader() {
  return (
    <div className="w-full h-full p-10 flex-1 flex items-center justify-center">
      <FaCircleNotch className="animate-spin text-4xl" />
    </div>
  );
}
