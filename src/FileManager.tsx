import { CreateFolderModal, UploadFileModal } from "./components/Modals";
import { useState, useEffect, useMemo, useRef, Fragment } from "react";
import { RefreshCw, FileText, Folder, Trash2, X } from "lucide-react";
import { FilePreviewWrapper } from "./components/FilePreviewWrapper";
import { getFolders, uploadFiles } from "./utils/requestHandlers";
import { DeleteConfirm } from "./components/Modals/DeletConfirm";
import { PreviewImage } from "./components/Modals/PreviewImage";
import { CopiedTooltip } from "./components/ui/CopiedTooltip";
import { CardContent, Button, Input } from "./components/ui";
import { ScreenLoading } from "./components/ScreenLoading";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { EmptyScreen } from "./components/EmptyScreen";
import { FixedSizeList as List } from "react-window";
import { Sidebar } from "./components/Sidebar";
import { IMAGE_URL } from "./constants";
import classNames from "classnames";
import React from "react";

const ROW_HEIGHT = 70;
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
  const [imageErrorPaths, setImageErrorPaths] = useState<
    Record<string, boolean>
  >({});
  const [fetchedChildren, setFetchedChildren] = useState<FetchedChildT>({});
  const [expandedPaths, setExpandedPaths] = useState<ExpandedPathsT>({});
  const [selectedFiles, setSelectedFiles] = useState<Array<string>>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>("");
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [select, setSelect] = useState(false);

  const timeoutId = useRef<ReturnType<typeof setTimeout>>(null);

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
    setSearch("");

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

  const isInFileManagerPage = (): boolean => {
    return (window as any)?.location?.pathname?.includes("elfinder-react");
  };

  const moveInFolder = (folderName: string) => {
    setSelectedPath((prev) => [...prev, folderName]);
    setSelectedFiles([]);
    setSelect(false);
  };

  const selectFileToogle = (fileName: string) => {
    const isSelected = !!selectedFiles.find(
      (selectedFileName) => fileName === selectedFileName
    );
    if (!isSelected) {
      setSelectedFiles([...selectedFiles, fileName]);
    } else {
      setSelectedFiles(
        selectedFiles.filter((fileName) => fileName !== fileName)
      );
    }
  };

  const copyFileName = ({ fileName, id }: { fileName: string; id: number }) => {
    const path =
      "images/" +
      (selectedPath.length
        ? selectedPath.join("/") + "/" + fileName
        : fileName);

    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    navigator.clipboard.writeText(path).then(() => {
      if (!isInFileManagerPage()) {
        (window as any)?.closeFileManager?.(path);
      } else {
        if ((window as any).takeCopyText) {
          (window as any)?.takeCopyText?.(path);
        }
      }

      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const handleClickOnItem = (item: Item) => {
    if (item.type === "folder") {
      return moveInFolder(item.name);
    }

    if (select) {
      return selectFileToogle(item.name);
    }

    return copyFileName({ id: item.id, fileName: item.name });
  };

  const searchFilteredItems = useMemo(
    () => items.filter(({ name }) => name.includes(search) || search === ""),
    [items, search]
  );

  const currentPathStr = selectedPath.join("/") || "Root";

  return (
    <div className="py-10 px-6">
      <div
        className={classNames(
          "h-full relative mx-auto border border-gray-200 bg-white p-6",
          {
            "max-w-[1200px] rounded-2xl shadow-lg": !isInFileManagerPage(),
            "max-w-full": isInFileManagerPage(),
          }
        )}
      >
        {!isInFileManagerPage() && (
          <div
            className="closeIcon absolute right-1 top-[0.5px] cursor-pointer"
            onClick={() => {
              (window as any).closeFileManager();
            }}
          >
            <X />
          </div>
        )}

        <div className="flex gap-6 m">
          <Sidebar
            setShowCreateFolder={setShowCreateFolder}
            setFetchedChildren={setFetchedChildren}
            setShowUploadFile={setShowUploadFile}
            setExpandedPaths={setExpandedPaths}
            setSelectedFiles={setSelectedFiles}
            setSelectedPath={setSelectedPath}
            setIsLoading={setIsLoading}
            setSelect={setSelect}
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
                {!!selectedFiles.length && (
                  <div
                    className="flex items-center justify-center gap-[1px] cursor-pointer"
                    onClick={() => {
                      setShowDeleteConfirm(true);
                    }}
                  >
                    <span className="text-[#ff0000]">
                      {selectedFiles.length} |
                    </span>
                    <Trash2 color="red" />
                  </div>
                )}
                <Button
                  className=" text-gray-500  min-w-[60px]"
                  onClick={() => {
                    if (select) {
                      setSelectedFiles([]);
                    }

                    setSelect((prev) => !prev);
                  }}
                  variant={select ? "default" : "ghost"}
                  size="icon"
                >
                  Select
                </Button>
                <Button
                  className="hover:bg-transparent text-gray-500 "
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
                  className="w-48 text-sm border border-gray-300  bg-transparent focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            <CardContent
              className={classNames(
                "p-4 relative rounded-xl border border-gray-200 bg-white shadow-sm",
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
                  height={600}
                  itemCount={Math.ceil(
                    searchFilteredItems.length / COLUMN_COUNT
                  )}
                  itemSize={ROW_HEIGHT}
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
                        className="mb-[20px] flex flex-wrap gap-4"
                      >
                        {rowItems.map((item) => {
                          const imageUrl =
                            IMAGE_URL +
                            "/" +
                            [...selectedPath, item.name].join("/");

                          return (
                            <FilePreviewWrapper
                              key={item.id}
                              item={item}
                              onClick={handleClickOnItem}
                              onShowPreview={() => {
                                setShowPreview(true);
                                setPreviewImageUrl(imageUrl);
                              }}
                            >
                              <div className="relative flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-100  hover:bg-gray-50 cursor-pointer">
                                {item.type === "folder" ? (
                                  <Folder className="min-w-5 min-h-5 w-5 h-5 text-yellow-500" />
                                ) : (
                                  <FileText className="z-10 min-w-5 min-h-5 w-5 h-5 text-gray-400" />
                                )}
                                <div className="truncate text-sm font-medium text-gray-800">
                                  {item.type === "file" ? (
                                    <Fragment>
                                      {imageErrorPaths[imageUrl] ? (
                                        "Image not Found"
                                      ) : (
                                        <img
                                          onError={() => {
                                            setImageErrorPaths({
                                              ...imageErrorPaths,
                                              [imageUrl]: true,
                                            });
                                          }}
                                          src={imageUrl}
                                          className="absolute object-cover rounded-lg left-0 top-0 h-[46px] w-[190px]"
                                        />
                                      )}
                                    </Fragment>
                                  ) : (
                                    item.name
                                  )}

                                  {copiedId === item.id && (
                                    <CopiedTooltip index={index} />
                                  )}
                                  {item.type === "file" && select && (
                                    <Input
                                      checked={
                                        !!selectedFiles.find(
                                          (fileName) => item.name === fileName
                                        )
                                      }
                                      onChange={() => {}}
                                      type="radio"
                                      className="absolute right-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                    />
                                  )}
                                </div>
                              </div>
                              {item.type === "file" && (
                                <p className="text-nowrap truncate text-sm font-medium text-gray-800">
                                  {(() => {
                                    const maxBaseLength = 16;
                                    const parts = item.name.split(".");
                                    const ext = parts.pop();
                                    const base = parts.join(".");

                                    const displayName =
                                      base.length > maxBaseLength
                                        ? base.slice(0, maxBaseLength) + "..."
                                        : base;

                                    return `${displayName}.${ext}`;
                                  })()}
                                </p>
                              )}
                            </FilePreviewWrapper>
                          );
                        })}
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

      {showDeleteConfirm && (
        <DeleteConfirm
          setSelectedPath={setSelectedPath}
          selectedFiles={selectedFiles}
          selectedPath={selectedPath}
          onClose={() => {
            setShowDeleteConfirm(false);
            setSelectedFiles([]);
            setSelect(false);
          }}
        />
      )}

      {showPreview && (
        <PreviewImage
          src={previewImageUrl}
          onClose={() => {
            setShowPreview(false);
            setPreviewImageUrl("");
          }}
        />
      )}
    </div>
  );
};

export default FileManager;
