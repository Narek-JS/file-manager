import { X } from "lucide-react";
import React from "react";

interface Props {
  onClose: () => void;
  src: string;
}

const PreviewImage: React.FC<Props> = ({ onClose, src }) => (
  <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
    <div
      className="absolute top-4 right-4 z-[101] text-white cursor-pointer"
      onClick={onClose}
    >
      <X size={28} />
    </div>
    <img
      src={src}
      className="scale-in max-w-4xl max-h-[90vh] object-contain bg-white rounded-xl shadow-lg"
    />
  </div>
);

export { PreviewImage };
