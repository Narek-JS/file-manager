import { uploadFiles } from "../../utils/requestHandlers";
import { useState } from "react";
import { Button } from "../ui";
import React from "react";

interface Props {
  setShowUploadFile: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedPath: React.Dispatch<React.SetStateAction<string[]>>;
  selectedPath: Array<string>;
  currentPathStr: string;
}

const UploadFile: React.FC<Props> = ({
  setShowUploadFile,
  setSelectedPath,
  currentPathStr,
  selectedPath,
}) => {
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append("folder", selectedPath.join("/"));
    formData.append("file", uploadFile);

    try {
      await uploadFiles(formData);

      setSelectedPath([...selectedPath]);
      setShowUploadFile(false);
      setUploadFile(null);
    } catch (err) {
      console.error("err --> ", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 flex flex-col items-center">
        <h2 className="text-lg font-semibold text-gray-800  text-center mb-6">
          Upload to: <span className="font-medium">{currentPathStr}</span>
        </h2>

        <label className="w-full mb-8">
          <input
            type="file"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            className="block w-full text-base text-gray-700  h-12 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-base file:font-medium file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
          />
        </label>

        <div className="flex w-full gap-4">
          <Button
            onClick={() => setShowUploadFile(false)}
            variant="outline"
            className="w-1/2 h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUploadSubmit}
            disabled={!uploadFile}
            className="w-1/2 h-12 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
};

export { UploadFile };
