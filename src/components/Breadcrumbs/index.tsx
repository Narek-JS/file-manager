import { ArrowLeft } from "lucide-react";
import { Button } from "../ui";
import React from "react";

interface Props {
  setSelectedPath: React.Dispatch<React.SetStateAction<Array<string>>>;
  selectedPath: Array<string>;
}

const Breadcrumbs: React.FC<Props> = ({ setSelectedPath, selectedPath }) => {
  const goBack = () => setSelectedPath((prev) => prev.slice(0, -1));

  return (
    <div className="flex items-center gap-2">
      {selectedPath.length > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="text-gray-500 dark:text-gray-400"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
      )}
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
        <span className="text-gray-400">Root</span>
        {selectedPath.map((name, index) => (
          <span key={index}>
            {" / "}
            <button
              className="hover:underline text-blue-500"
              onClick={() => setSelectedPath(selectedPath.slice(0, index + 1))}
            >
              {name}
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export { Breadcrumbs };
