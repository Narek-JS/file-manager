import { Card, CardContent, Button, Input } from "./components/ui";
import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  RefreshCw,
  ArrowLeft,
  FileText,
  Upload,
  Folder,
  Plus,
} from "lucide-react";

interface Item {
  id: number;
  name: string;
  type: "folder" | "file";
}

const FileManager: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>(
    {}
  );
  const [fetchedChildren, setFetchedChildren] = useState<
    Record<string, { folders: string[]; files: string[] }>
  >({});

  useEffect(() => {
    const loadRoot = async () => {
      try {
        const res = await fetch(
          "../data/data.json"
          // "https://api.fasttv.dev.yospace.ai/api/s3/folders/"
        );
        const data = await res.json();
        setFetchedChildren((prev) => ({ ...prev, [""]: data }));
      } catch {
        setFetchedChildren((prev) => ({
          ...prev,
          [""]: { folders: [], files: [] },
        }));
      }
    };

    loadRoot();
  }, []);

  useEffect(() => {
    const currentPath = selectedPath.join("/");
    setItems([]);

    const loadFolderContent = async () => {
      try {
        const res = await fetch(
          // `https://api.fasttv.dev.yospace.ai/api/s3/folders/${currentPath}`
          `../data/${currentPath}.json`
        );
        const data = await res.json();

        const folders: Item[] = (data.folders || []).map(
          (name: string, index: number) => ({
            id: index,
            name,
            type: "folder",
          })
        );

        const files: Item[] = (data.files || []).map(
          (fileName: string, index: number) => ({
            id: index + 1000,
            name: fileName,
            type: "file",
          })
        );

        setItems([...folders, ...files]);
      } catch {
        setItems([]);
      }
    };

    if (selectedPath.length > 0) loadFolderContent();
  }, [selectedPath.join("/")]);

  const goBack = () => setSelectedPath((prev) => prev.slice(0, -1));

  const toggleExpand = async (path: string) => {
    setExpandedPaths((prev) => ({ ...prev, [path]: !prev[path] }));

    if (!fetchedChildren[path]) {
      try {
        const res = await fetch(
          `https://api.fasttv.dev.yospace.ai/api/s3/folders/${path}`
        );
        const data = await res.json();
        setFetchedChildren((prev) => ({ ...prev, [path]: data }));
      } catch {
        setFetchedChildren((prev) => ({
          ...prev,
          [path]: { folders: [], files: [] },
        }));
      }
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
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </span>
                <Folder className="w-4 h-4 text-yellow-500" />
                <span className="truncate text-sm">{folderName}</span>
              </div>
              {isExpanded && renderTree(fullPath)}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderBreadcrumbs = () => (
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
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 py-10 px-6">
      <div className="max-w-7xl mx-auto border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg bg-white dark:bg-gray-900 p-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 pr-4 overflow-auto max-h-[70vh]">
            <div className="mb-4 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 dark:text-gray-300 hover:bg-transparent"
              >
                <Plus className="w-4 h-4 mr-1" /> New
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 dark:text-gray-300 hover:bg-transparent"
              >
                <Upload className="w-4 h-4 mr-1" /> Upload
              </Button>
            </div>
            {renderTree([])}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
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
                {renderBreadcrumbs()}
              </div>
              <div className="flex gap-2 items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-transparent text-gray-500 dark:text-gray-400"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Search"
                  className="w-48 text-sm border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            <Card className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                    onClick={() =>
                      item.type === "folder" &&
                      setSelectedPath((prev) => [...prev, item.name])
                    }
                  >
                    {item.type === "folder" ? (
                      <Folder className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <FileText className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                      {item.name}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileManager;
