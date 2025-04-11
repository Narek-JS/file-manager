import { deleteFiles } from "../../utils/requestHandlers";
import { Button } from "../ui";
import React from "react";

interface Props {
  onClose: () => void;
  selectedPath: Array<string>;
  selectedFiles: Array<string>;
  setSelectedPath: React.Dispatch<React.SetStateAction<string[]>>;
}

const DeleteConfirm: React.FC<Props> = ({
  onClose,
  selectedPath,
  selectedFiles,
  setSelectedPath,
}) => {
  const deleteSelectedFiles = async () => {
    try {
      const currentPath = selectedPath.join("/");
      const res = await deleteFiles({
        folder: currentPath,
        files: selectedFiles,
      });

      if (res.ok) {
        setSelectedPath([...selectedPath]);
      }

      onClose();
    } catch (err) {
      console.error("err --> ", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-8 flex flex-col items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center mb-6">
          Create Folder in:
        </h2>

        <div className="flex w-full gap-4">
          <Button variant="outline" className="w-1/2 h-12" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="w-1/2 h-12 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={deleteSelectedFiles}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export { DeleteConfirm };
