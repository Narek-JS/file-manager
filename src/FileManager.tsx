import { Card, CardContent, Button, Input } from "./components/ui";
import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronRight,
  LoaderCircle,
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

const S3_API_KEY =
  "vLFJj11KHqz1fzbpRCvhGpU2T8yOYBZX6gY9bvVNcAKmbzPv5C3RTLvtHrqceCWs";

const FileManager: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>(
    {}
  );
  const [fetchedChildren, setFetchedChildren] = useState<
    Record<string, { folders: string[]; files: string[] }>
  >({});

  useEffect(() => {
    const loadRoot = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          "https://api.fasttv.dev.yospace.ai/api/s3/folders/",
          { headers: { "s3-api-key": S3_API_KEY } }
        );
        const data = await res.json();
        setFetchedChildren((prev) => ({ ...prev, [""]: data.data }));
      } catch {
        setFetchedChildren((prev) => ({
          ...prev,
          [""]: { folders: [], files: [] },
        }));
      }
      setIsLoading(false);
    };

    loadRoot();
  }, []);

  useEffect(() => {
    const currentPath = selectedPath.join("/");
    setItems([]);

    const loadFolderContent = async () => {
      setIsLoading(true);

      try {
        const res = await fetch(
          `https://api.fasttv.dev.yospace.ai/api/s3/folders${
            currentPath ? `?folder=${currentPath}` : ""
          }`,
          { headers: { "s3-api-key": S3_API_KEY } }
        );
        const data = await res.json();
        const folders: Item[] = (data.data.folders || []).map(
          (name: string, index: number) => ({
            id: index,
            name,
            type: "folder",
          })
        );

        const files: Item[] = (data.data.images || []).map(
          (fileName: string, index: number) => ({
            id: index + 1000,
            name: fileName,
            type: "file",
          })
        );

        setItems([...folders, ...files]);

        // Ensure all levels in the path are expanded
        const expanded: Record<string, boolean> = {};
        selectedPath.forEach((_, index) => {
          const key = selectedPath.slice(0, index + 1).join("/");
          expanded[key] = true;
        });
        setExpandedPaths((prev) => ({ ...prev, ...expanded }));

        // Fetch all levels of path
        for (let i = 0; i < selectedPath.length; i++) {
          const subPath = selectedPath.slice(0, i + 1).join("/");
          if (!fetchedChildren[subPath]) {
            const res = await fetch(
              `https://api.fasttv.dev.yospace.ai/api/s3/folders?folder=${subPath}`,
              { headers: { "s3-api-key": S3_API_KEY } }
            );
            const subData = await res.json();
            setFetchedChildren((prev) => ({
              ...prev,
              [subPath]: subData.data,
            }));
          }
        }
      } catch {
        setItems([]);
      }

      setIsLoading(false);
    };

    loadFolderContent();
  }, [selectedPath]);

  const goBack = () => setSelectedPath((prev) => prev.slice(0, -1));

  const toggleExpand = async (path: string) => {
    setExpandedPaths((prev) => ({ ...prev, [path]: !prev[path] }));

    if (!fetchedChildren[path]) {
      setIsLoading(true);

      try {
        const res = await fetch(
          `https://api.fasttv.dev.yospace.ai/api/s3/folders?folder=${path}`,
          { headers: { "s3-api-key": S3_API_KEY } }
        );
        const data = await res.json();
        setFetchedChildren((prev) => ({ ...prev, [path]: data.data }));
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

  const handleUpload = async (files: FileList | null) => {
    if (!files) return;
    const currentPath = selectedPath.join("/");
    const formData = new FormData();
    formData.append("folder", currentPath);

    Array.from(files).forEach((file) => {
      formData.append("file", file);
    });

    try {
      setIsLoading(true);

      const res = await fetch(
        "https://api.fasttv.dev.yospace.ai/api/s3/upload/",
        {
          method: "POST",
          headers: {
            "s3-api-key": S3_API_KEY,
          },
          body: formData,
        }
      );

      if (res.ok) {
        // Refresh folder contents after upload
        setSelectedPath([...selectedPath]);
        const updated = await res.json();
        console.log("Upload success:", updated);
      } else {
        console.error("Upload failed:", await res.text());
      }
    } catch (err) {
      console.error("Upload error:", err);
    }

    setIsLoading(false);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) return;

    const currentPath = [...selectedPath, newFolderName].join("/");
    const formData = new FormData();
    formData.append("folder", currentPath);

    try {
      await fetch("https://api.fasttv.dev.yospace.ai/api/s3/upload/", {
        method: "POST",
        headers: {
          "s3-api-key": S3_API_KEY,
        },
        body: formData,
      });

      setSelectedPath([...selectedPath, newFolderName]);
      setShowCreateFolder(false);
      setNewFolderName("");
    } catch (err) {
      console.error("Error creating folder", err);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append("folder", selectedPath.join("/"));
    formData.append("file", uploadFile);

    try {
      await fetch("https://api.fasttv.dev.yospace.ai/api/s3/upload/", {
        method: "POST",
        headers: {
          "s3-api-key": S3_API_KEY,
        },
        body: formData,
      });

      setSelectedPath([...selectedPath]);
      setShowUploadFile(false);
      setUploadFile(null);
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleDrag: React.DragEventHandler<HTMLDivElement> = function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleUpload(e.dataTransfer.files);
  };

  const searchFilteredItems = useMemo(
    () => items.filter(({ name }) => name.includes(search) || search === ""),
    [items, search]
  );

  const currentPathStr = selectedPath.join("/") || "Root";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 py-10 px-6">
      <div className="relative max-w-7xl mx-auto border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg bg-white dark:bg-gray-900 p-6">
        <div className="flex gap-6 m">
          {/* Sidebar */}
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
            <div className="overflow-auto max-h-[399px] px-1">
              {renderTree([])}
            </div>
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
                  className="hover:bg-transparent text-gray-500 dark:text-gray-400"
                  onClick={() => {
                    setSelectedPath([...selectedPath]);
                  }}
                  variant="ghost"
                  size="icon"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Input
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  value={search}
                  placeholder="Search"
                  className="w-48 text-sm border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            <Card className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent
                className={
                  "p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 relative" +
                  `${dragActive ? " opacity-50 bg-gray-200" : ""}` +
                  `${
                    !searchFilteredItems.length && search
                      ? " min-h-[100px]"
                      : ""
                  }` +
                  `${
                    !searchFilteredItems.length && !search
                      ? " !flex min-h-[380px] h-full"
                      : ""
                  }`
                }
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {searchFilteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                    onClick={() =>
                      item.type === "folder" &&
                      setSelectedPath((prev) => [...prev, item.name])
                    }
                  >
                    {item.type === "folder" ? (
                      <Folder className="min-w-5 min-h-5 w-5 h-5 text-yellow-500" />
                    ) : (
                      <FileText className="min-w-5 min-h-5 w-5 h-5 text-gray-400" />
                    )}
                    <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                      {item.name}
                    </span>
                  </div>
                ))}

                {!searchFilteredItems.length && search && (
                  <div className="font-sans text-gray-400 text-[32px] absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
                    Empty
                  </div>
                )}

                {!searchFilteredItems.length && !search && (
                  <div className="mx-auto flex items-center justify-center flex-col w-full font-sans text-gray-400">
                    <Folder size={70} />
                    <p>This Folder is empty</p>
                    <p>Drag files here to upload</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {isLoading && (
          <div className="w-full h-full absolute top-0 left-0 z-20 flex items-center justify-center">
            <div className="w-full h-full bg-gray-200 opacity-50" />
            <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <LoaderCircle className="animate-spin" />
            </p>
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-8 flex flex-col items-center">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center mb-6">
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
      )}

      {/* Upload File Modal */}
      {showUploadFile && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-8 flex flex-col items-center">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center mb-6">
              Upload to: <span className="font-medium">{currentPathStr}</span>
            </h2>

            <label className="w-full mb-8">
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="block w-full text-base text-gray-700 dark:text-gray-200 h-12 file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-base file:font-medium
            file:bg-blue-100 file:text-blue-700
            hover:file:bg-blue-200
            cursor-pointer"
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
      )}
    </div>
  );
};

export default FileManager;
