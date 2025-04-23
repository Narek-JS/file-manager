import React, { useState } from "react";
import { Eye } from "lucide-react";

interface FilePreviewWrapperProps {
  item: { id: number; name: string; type: "file" | "folder" };
  onClick: (item: any) => void;
  onShowPreview: () => void;
  children: React.ReactNode;
}

const FilePreviewWrapper: React.FC<FilePreviewWrapperProps> = ({
  onShowPreview,
  children,
  onClick,
  item,
}) => {
  const [hovered, setHovered] = useState(false);

  const isImage =
    item.type === "file" && /\.(png|jpe?g|webp)$/i.test(item.name);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClick(item);
        }}
      >
        {children}
      </div>

      {hovered && isImage && (
        <div
          className="absolute top-2 right-2 bg-white rounded-full shadow-md cursor-pointer z-10"
          onClick={(e) => {
            e.stopPropagation();
            onShowPreview();
          }}
        >
          <Eye className="w-5 h-5 text-gray-600 m-1" />
        </div>
      )}
    </div>
  );
};

export { FilePreviewWrapper };
