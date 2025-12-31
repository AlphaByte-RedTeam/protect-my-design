"use client";

import { CheckCircle, File, Loader2, RotateCcw, Upload, X } from "lucide-react";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "@/components/ui/copy";
import type { UseSupabaseUploadReturn } from "@/hooks/use-supabase-upload";
import { getOsType } from "@/lib/getOsType";
import { cn } from "@/lib/utils";
import { DownloadIcon } from "./ui/download";
import { Input } from "./ui/input";
import { Kbd, KbdGroup } from "./ui/kbd";

export const formatBytes = (
  bytes: number,
  decimals = 2,
  size?: "bytes" | "KB" | "MB" | "GB" | "TB" | "PB" | "EB" | "ZB" | "YB",
) => {
  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  if (bytes === 0 || bytes === undefined)
    return size !== undefined ? `0 ${size}` : "0 bytes";
  const i =
    size !== undefined
      ? sizes.indexOf(size)
      : Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / k ** i).toFixed(dm)) + " " + sizes[i];
};

type DropzoneContextType = Omit<
  UseSupabaseUploadReturn,
  "getRootProps" | "getInputProps"
>;

const DropzoneContext = createContext<DropzoneContextType | undefined>(
  undefined,
);

type DropzoneProps = UseSupabaseUploadReturn & {
  className?: string;
};

const Dropzone = ({
  className,
  children,
  getRootProps,
  getInputProps,
  ...restProps
}: PropsWithChildren<DropzoneProps>) => {
  const isSuccess = restProps.isSuccess;
  const isActive = restProps.isDragActive;
  const isInvalid =
    (restProps.isDragActive && restProps.isDragReject) ||
    (restProps.errors.length > 0 && !restProps.isSuccess) ||
    restProps.files.some((file) => file.errors.length !== 0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+O or Cmd+O
      if ((e.ctrlKey || e.metaKey) && e.key === "o") {
        e.preventDefault();
        restProps.open();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [restProps.open]);

  return (
    <DropzoneContext.Provider value={{ ...restProps }}>
      <div
        {...getRootProps({
          className: cn(
            "border-2 border-gray-300 rounded-lg p-6 text-center bg-card transition-colors duration-300 text-foreground",
            className,
            isSuccess ? "border-solid" : "border-dashed",
            isActive && "border-primary bg-primary/10",
            isInvalid && "border-destructive bg-destructive/10",
          ),
        })}
      >
        <Input {...getInputProps()} />
        {children}
      </div>
    </DropzoneContext.Provider>
  );
};
const DropzoneContent = ({ className }: { className?: string }) => {
  const {
    files,
    setFiles,
    onUpload,
    loading,
    successes,
    setSuccesses,
    errors,
    setErrors,
    maxFileSize,
    maxFiles,
    isSuccess,
    getPublicUrl,
  } = useDropzoneContext();

  const exceedMaxFiles = files.length > maxFiles;

  const handleRemoveFile = useCallback(
    (fileName: string) => {
      setFiles(files.filter((file) => file.name !== fileName));
    },
    [files, setFiles],
  );

  const handleReset = () => {
    setFiles([]);
    setSuccesses([]);
    setErrors([]);
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName; // This forces download with the correct name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  if (isSuccess) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-y-4 justify-center w-full",
          className,
        )}
      >
        <div className="flex flex-row items-center gap-x-2">
          <CheckCircle size={16} className="text-primary" />
          <p className="text-primary text-sm">
            Successfully uploaded {files.length} file
            {files.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full">
          {files.map((file) => {
            const url = getPublicUrl(file.name);
            return (
              <div
                key={file.name}
                className="flex flex-col gap-2 border p-4 rounded-md"
              >
                <p className="font-medium text-sm truncate">{file.name}</p>
                <div className="flex gap-2 items-center text-muted-foreground">
                  <Input readOnly value={url} />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleCopy(url)}
                  >
                    <CopyIcon />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDownload(url, file.name)}
                  >
                    <DownloadIcon /> Download
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <Button onClick={handleReset} size="sm" variant="ghost">
          <RotateCcw />
          Upload another file
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {files.map((file, idx) => {
        const fileError = errors.find((e) => e.name === file.name);
        const isSuccessfullyUploaded = !!successes.find((e) => e === file.name);

        return (
          <div
            key={`${file.name}-${idx}`}
            className="flex items-center gap-x-4 border-b py-2 first:mt-4 last:mb-4 "
          >
            {file.type.startsWith("image/") ? (
              <div className="h-10 w-10 rounded border overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                <img
                  src={file.preview}
                  alt={file.name}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center">
                <File size={18} />
              </div>
            )}

            <div className="shrink grow flex flex-col items-start truncate">
              <p title={file.name} className="text-sm truncate max-w-full">
                {file.name}
              </p>
              {file.errors.length > 0 ? (
                <p className="text-xs text-destructive">
                  {file.errors
                    .map((e) =>
                      e.message.startsWith("File is larger than")
                        ? `File is larger than ${formatBytes(maxFileSize, 2)} (Size: ${formatBytes(file.size, 2)})`
                        : e.message,
                    )
                    .join(", ")}
                </p>
              ) : loading && !isSuccessfullyUploaded ? (
                <p className="text-xs text-muted-foreground">
                  Uploading file...
                </p>
              ) : fileError ? (
                <p className="text-xs text-destructive">
                  Failed to upload: {fileError.message}
                </p>
              ) : isSuccessfullyUploaded ? (
                <p className="text-xs text-primary">
                  Successfully uploaded file
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size, 2)}
                </p>
              )}
            </div>

            {!loading && !isSuccessfullyUploaded && (
              <Button
                size="icon"
                variant="link"
                className="shrink-0 justify-self-end text-muted-foreground hover:text-foreground"
                onClick={() => handleRemoveFile(file.name)}
              >
                <X />
              </Button>
            )}
          </div>
        );
      })}
      {exceedMaxFiles && (
        <p className="text-sm text-left mt-2 text-destructive">
          You may upload only up to {maxFiles} files, please remove{" "}
          {files.length - maxFiles} file
          {files.length - maxFiles > 1 ? "s" : ""}.
        </p>
      )}
      {files.length > 0 && !exceedMaxFiles && (
        <div className="mt-2">
          <Button
            variant="outline"
            onClick={onUpload}
            disabled={files.some((file) => file.errors.length !== 0) || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>Upload files</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

const DropzoneEmptyState = ({ className }: { className?: string }) => {
  const { maxFiles, maxFileSize, inputRef, isSuccess } = useDropzoneContext();
  const os = getOsType();

  if (isSuccess) {
    return null;
  }

  return (
    <div className={cn("flex flex-col items-center gap-y-2", className)}>
      <Upload size={20} className="text-muted-foreground" />
      <p className="text-sm">
        Upload{!!maxFiles && maxFiles > 1 ? ` ${maxFiles}` : ""} file
        {!maxFiles || maxFiles > 1 ? "s" : ""}
      </p>
      <p className="text-sm hidden sm:block">
        Press{" "}
        <KbdGroup>
          <Kbd>
            {os === "mac" ? "⌘" : "Ctrl"}
            <span>+</span>O
          </Kbd>
        </KbdGroup>{" "}
        to open file dialog
      </p>
      <div className="flex flex-col items-center gap-y-1">
        <p className="text-xs text-muted-foreground">
          Drag and drop or{" "}
          <Button
            variant="link"
            onClick={() => inputRef.current?.click()}
            className="underline p-0 text-xs cursor-pointer transition hover:text-foreground"
          >
            select {maxFiles === 1 ? `file` : "files"}
          </Button>{" "}
          to upload
        </p>
        {maxFileSize !== Number.POSITIVE_INFINITY && (
          <p className="text-xs text-muted-foreground">
            Maximum file size: {formatBytes(maxFileSize, 2)}
          </p>
        )}
      </div>
    </div>
  );
};

const useDropzoneContext = () => {
  const context = useContext(DropzoneContext);

  if (!context) {
    throw new Error("useDropzoneContext must be used within a Dropzone");
  }

  return context;
};

export { Dropzone, DropzoneContent, DropzoneEmptyState, useDropzoneContext };
