import { uploadFiles } from "../../utils/requestHandlers";
import { Button, Input } from "../ui";
import { useState } from "react";
import React from "react";

interface Props {
  setShowCreateFolder: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedPath: React.Dispatch<React.SetStateAction<string[]>>;
  selectedPath: Array<string>;
  currentPathStr: string;
}

const CreateFolder: React.FC<Props> = ({
  setShowCreateFolder,
  setSelectedPath,
  currentPathStr,
  selectedPath,
}) => {
  const [newFolderName, setNewFolderName] = useState("");

  const handleCreateFolder = async () => {
    if (!newFolderName) return;

    const currentPath = [...selectedPath, newFolderName].join("/");
    const formData = new FormData();
    formData.append("folder", currentPath);

    try {
      await uploadFiles(formData);

      setSelectedPath([...selectedPath, newFolderName]);
      setShowCreateFolder(false);
      setNewFolderName("");
    } catch (err) {
      console.error("err --> ", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 flex flex-col items-center">
        <h2 className="text-lg font-semibold text-gray-800 text-center mb-6">
          Create Folder in:{" "}
          <span className="font-medium">{currentPathStr}</span>
        </h2>

        <Input
          placeholder="Folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          className="w-full h-12 text-base px-4 mb-8"
        />

        <div className="flex w-full gap-4">
          <Button
            onClick={() => setShowCreateFolder(false)}
            variant="outline"
            className="w-1/2 h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateFolder}
            className="w-1/2 h-12 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
};

export { CreateFolder };
