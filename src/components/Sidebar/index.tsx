import { ChevronDown, ChevronRight, Folder, Plus, Upload } from "lucide-react";
import { ExpandedPathsT, FetchedChildT } from "../../FileManager";
import { getFolders } from "../../utils/requestHandlers";
import { Button } from "../ui";
import classNames from "classnames";
import React from "react";

interface Props {
  setFetchedChildren: React.Dispatch<React.SetStateAction<FetchedChildT>>;
  setExpandedPaths: React.Dispatch<React.SetStateAction<ExpandedPathsT>>;
  setSelectedFiles: React.Dispatch<React.SetStateAction<Array<string>>>;
  setSelectedPath: React.Dispatch<React.SetStateAction<Array<string>>>;
  setShowCreateFolder: React.Dispatch<React.SetStateAction<boolean>>;
  setShowUploadFile: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSelect: React.Dispatch<React.SetStateAction<boolean>>;
  fetchedChildren: FetchedChildT;
  expandedPaths: ExpandedPathsT;
  selectedPath: Array<string>;
}

const Sidebar: React.FC<Props> = ({
  setShowCreateFolder,
  setFetchedChildren,
  setShowUploadFile,
  setExpandedPaths,
  setSelectedFiles,
  setSelectedPath,
  fetchedChildren,
  expandedPaths,
  selectedPath,
  setIsLoading,
  setSelect,
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
                className={classNames(
                  "flex items-center gap-1 cursor-pointer py-1 hover:bg-gray-100 px-1 rounded",
                  {
                    "bg-gray-200 text-blue-500 font-medium":
                      selectedPath.join("/") === fullKey,
                  }
                )}
                onClick={() => {
                  setSelectedFiles([]);
                  setSelect(false);
                  setSelectedPath(fullPath);
                }}
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
    <div className="w-64 border-r border-gray-200 pr-4 overflow-auto">
      <div className="sticky top-0 z-10 bg-white  flex gap-2 pt-1 pb-2 px-1 border-b border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600  hover:bg-transparent"
          onClick={() => setShowCreateFolder(true)}
        >
          <Plus className="w-4 h-4 mr-1" /> New
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600  hover:bg-transparent"
          onClick={() => setShowUploadFile(true)}
        >
          <Upload className="w-4 h-4 mr-1" /> Upload
        </Button>
      </div>
      <div className="overflow-auto max-h-[900px] px-1">{renderTree([])}</div>
    </div>
  );
};

export { Sidebar };
