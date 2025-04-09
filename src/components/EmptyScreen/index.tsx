import React from "react";
import { Folder } from "lucide-react";

interface Props {
  isOnlyText?: boolean;
}

const EmptyScreen: React.FC<Props> = ({ isOnlyText }) => {
  if (isOnlyText) {
    return (
      <div className="font-sans text-gray-400 text-[32px] absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
        Empty
      </div>
    );
  }

  return (
    <div className="mx-auto flex items-center justify-center flex-col w-full font-sans text-gray-400">
      <Folder size={70} />
      <p>This Folder is empty</p>
      <p>Drag files here to upload</p>
    </div>
  );
};

export { EmptyScreen };
