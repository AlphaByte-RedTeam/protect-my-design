"use client";

import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/dropzone";
import Footer from "@/components/footer";
import Logo from "@/components/logo";
import ThemeToggler from "@/components/theme-toggler";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";

export default function Home() {
  const props = useSupabaseUpload({
    bucketName: "preview-assets",
    allowedMimeTypes: ["image/*"],
    maxFiles: 2,
    maxFileSize: 1000 * 1000 * 10, // 10MB,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-1 font-sans dark:bg-dark-brand-1">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-16 px-4 bg-brand-1 dark:bg-dark-brand-1 sm:items-center">
        <div className="flex flex-row justify-between w-full items-center">
          <Logo />
          <ThemeToggler />
        </div>
        <div>
          <Dropzone {...props}>
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>
        </div>
        <Footer />
      </main>
    </div>
  );
}
