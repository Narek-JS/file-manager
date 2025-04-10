import { LoaderCircle } from "lucide-react";
import React from "react";

const ScreenLoading: React.FC = () => {
  return (
    <div className="w-full h-full absolute top-0 left-0 z-20 flex items-center justify-center">
      <div className="w-full h-full bg-gray-200 opacity-50" />
      <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <LoaderCircle className="animate-spin" />
      </p>
    </div>
  );
};

export { ScreenLoading };
