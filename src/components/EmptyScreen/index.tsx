import { Folder } from "lucide-react";
import React from "react";

interface Props {
  isOnlyText?: boolean;
}

const EmptyScreen: React.FC<Props> = ({ isOnlyText }) => {
  if (isOnlyText) {
    return (
      <div className="w-full font-sans text-gray-400 text-[32px] min-h-[600px] flex items-center justify-center">
        <p>Empty</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex items-center justify-center flex-col w-full font-sans text-gray-400 min-h-[600px]">
      <Folder size={70} />
      <p>This Folder is empty</p>
      <p>Drag files here to upload</p>
    </div>
  );
};

export { EmptyScreen };
