import React from "react";

import { ChevronDown, ChevronRight, Folder, Plus, Upload } from "lucide-react";
import { getFolders } from "../../utils/requestHandlers";
import { Button } from "../ui";

interface Props {
  setShowCreateFolder: any;
  setFetchedChildren: any;
  setShowUploadFile: any;
  setExpandedPaths: any;
  setSelectedPath: any;
  fetchedChildren: any;
  expandedPaths: any;
  selectedPath: any;
  setIsLoading: any;
}

const Sidebar: React.FC<Props> = ({
  setShowCreateFolder,
  setFetchedChildren,
  setShowUploadFile,
  setExpandedPaths,
  setSelectedPath,
  fetchedChildren,
  expandedPaths,
  selectedPath,
  setIsLoading,
}) => {
  const toggleExpand = async (path: string) => {
    setExpandedPaths((prev) => ({ ...prev, [path]: !prev[path] }));

    if (!fetchedChildren[path]) {
      setIsLoading(true);

      try {
        const data = await getFolders(path);
        setFetchedChildren((prev) => ({ ...prev, [path]: data }));
      } catch {
        setFetchedChildren((prev) => ({
          ...prev,
          [path]: { folders: [], files: [] },
        }));
      }
      setIsLoading(false);
    }
  };

  const renderTree = (path: string[] = []) => {
    const key = path.join("/");
    const node = fetchedChildren[key];
    if (!node) return null;

    return (
      <ul className="pl-2">
        {node.folders.map((folderName) => {
          const fullPath = [...path, folderName];
          const fullKey = fullPath.join("/");
          const isExpanded = expandedPaths[fullKey];

          return (
            <li key={fullKey}>
              <div
                className={`flex items-center gap-1 cursor-pointer py-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-1 rounded ${
                  selectedPath.join("/") === fullKey
                    ? "bg-gray-200 dark:bg-gray-700 text-blue-500 font-medium"
                    : ""
                }`}
                onClick={() => setSelectedPath(fullPath)}
              >
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(fullKey);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="min-w-4 min-h-4 w-4 h-4" />
                  ) : (
                    <ChevronRight className="min-w-4 min-h-4 w-4 h-4" />
                  )}
                </span>
                <Folder className="min-w-4 min-h-4 w-4 h-4 text-yellow-500" />
                <span className="truncate text-sm">{folderName}</span>
              </div>
              {isExpanded && renderTree(fullPath)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-700 pr-4 overflow-auto">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 flex gap-2 pt-1 pb-2 px-1 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 dark:text-gray-300 hover:bg-transparent"
          onClick={() => setShowCreateFolder(true)}
        >
          <Plus className="w-4 h-4 mr-1" /> New
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 dark:text-gray-300 hover:bg-transparent"
          onClick={() => setShowUploadFile(true)}
        >
          <Upload className="w-4 h-4 mr-1" /> Upload
        </Button>
      </div>
      <div className="overflow-auto max-h-[399px] px-1">{renderTree([])}</div>
    </div>
  );
};

export { Sidebar };
