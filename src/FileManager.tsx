import { CreateFolderModal, UploadFileModal } from "./components/Modals";
import { CardContent, Button, Input } from "./components/ui";
import { getFolders, uploadFiles } from "./utils/requestHandlers";
import { RefreshCw, FileText, Folder } from "lucide-react";
import { ScreenLoading } from "./components/ScreenLoading";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { EmptyScreen } from "./components/EmptyScreen";
import { useState, useEffect, useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import { Sidebar } from "./components/Sidebar";
import classNames from "classnames";
import React from "react";

const ROW_HEIGHT = 40;
const COLUMN_COUNT = 4;

interface Item {
  type: "folder" | "file";
  name: string;
  id: number;
}

export type FetchedChildT = Record<
  string,
  { folders: string[]; files: string[] }
>;
export type ExpandedPathsT = Record<string, boolean>;

const FileManager: React.FC = () => {
  const [fetchedChildren, setFetchedChildren] = useState<FetchedChildT>({});
  const [expandedPaths, setExpandedPaths] = useState<ExpandedPathsT>({});
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const loadRoot = async () => {
      setIsLoading(true);

      try {
        const data = await getFolders();
        setFetchedChildren((prev) => ({ ...prev, [""]: data }));
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
        const data = await getFolders(currentPath);

        const folders = (data?.folders || []).map(
          (name: string, index: number) => ({
            id: index,
            name,
            type: "folder",
          })
        );

        const files = (data?.images || []).map(
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

        for (let i = 0; i < selectedPath.length; i++) {
          const subPath = selectedPath.slice(0, i + 1).join("/");
          if (!fetchedChildren[subPath]) {
            const subData = await getFolders(subPath);

            setFetchedChildren((prev) => ({
              ...prev,
              [subPath]: subData,
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

      const res = await uploadFiles(formData);

      if (res.ok) {
        setSelectedPath([...selectedPath]);
      }
    } catch (err) {
      console.error("err --> ", err);
    }

    setIsLoading(false);
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
          <Sidebar
            setShowCreateFolder={setShowCreateFolder}
            setFetchedChildren={setFetchedChildren}
            setShowUploadFile={setShowUploadFile}
            setExpandedPaths={setExpandedPaths}
            setSelectedPath={setSelectedPath}
            setIsLoading={setIsLoading}
            fetchedChildren={fetchedChildren}
            expandedPaths={expandedPaths}
            selectedPath={selectedPath}
          />

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <Breadcrumbs
                setSelectedPath={setSelectedPath}
                selectedPath={selectedPath}
              />

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
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                  placeholder="Search"
                  className="w-48 text-sm border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            <CardContent
              className={classNames(
                "p-4 relative rounded-xl border border-gray-200 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700",
                {
                  "!flex": !searchFilteredItems.length || true,
                  "opacity-50 bg-gray-200": dragActive,
                }
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {searchFilteredItems.length > 0 ? (
                <List
                  height={355}
                  itemCount={Math.ceil(
                    searchFilteredItems.length / COLUMN_COUNT
                  )}
                  itemSize={ROW_HEIGHT + 16}
                  width="100%"
                >
                  {({ index, style }) => {
                    const startIndex = index * COLUMN_COUNT;
                    const rowItems = searchFilteredItems.slice(
                      startIndex,
                      startIndex + COLUMN_COUNT
                    );

                    return (
                      <div
                        style={style}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 !pb-[200px]"
                      >
                        {rowItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                            onClick={() => {
                              if (item.type === "folder") {
                                setSelectedPath((prev) => [...prev, item.name]);
                              }
                            }}
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
                      </div>
                    );
                  }}
                </List>
              ) : (
                <EmptyScreen isOnlyText={Boolean(search)} />
              )}
            </CardContent>
          </div>
        </div>

        {isLoading && <ScreenLoading />}
      </div>

      {showCreateFolder && (
        <CreateFolderModal
          setShowCreateFolder={setShowCreateFolder}
          setSelectedPath={setSelectedPath}
          currentPathStr={currentPathStr}
          selectedPath={selectedPath}
        />
      )}

      {showUploadFile && (
        <UploadFileModal
          setShowUploadFile={setShowUploadFile}
          setSelectedPath={setSelectedPath}
          currentPathStr={currentPathStr}
          selectedPath={selectedPath}
        />
      )}
    </div>
  );
};

export default FileManager;
