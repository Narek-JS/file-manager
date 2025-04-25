import React, { useState } from "react";
import { X, Ban } from "lucide-react";
import classNames from "classnames";

interface Props {
  onClose: () => void;
  src: string;
}

const PreviewImage: React.FC<Props> = ({ onClose, src }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div
        className="absolute top-4 right-4 z-[101] text-white cursor-pointer"
        onClick={onClose}
      >
        <X size={28} />
      </div>
      <img
        src={src}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={classNames(
          "max-w-4xl max-h-[90vh] object-contain bg-white rounded-xl shadow-lg scale-0",
          { "scale-in": isLoaded }
        )}
      />

      {error && (
        <div className="scale-in max-w-[300px] min-h-[150px] w-full bg-white rounded-xl !flex items-center justify-center">
          <div className="flex items-center justify-center gap-[10px]">
            <Ban size={32} />
            <p className="font-semibold text-[22px]">Image not Found</p>
          </div>
        </div>
      )}
    </div>
  );
};

export { PreviewImage };
