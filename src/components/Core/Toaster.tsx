import { Toaster } from "sonner";

export default function ToasterGlobal() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: `!rounded-lg !border !bg-card !text-card-foreground !shadow 
      data-[type=error]:!bg-red-100 data-[type=error]:!text-red-800 data-[type=error]:!border-red-800/20 data-[type=error]:dark:!bg-red-800 data-[type=error]:dark:!text-red-100 data-[type=error]:dark:!border-red-100/20
      data-[type=success]:!bg-green-100 data-[type=success]:!text-green-800 data-[type=success]:!border-green-800/20 data-[type=success]:dark:!bg-green-800 data-[type=success]:dark:!text-green-100 data-[type=success]:dark:!border-green-100/20
      !bg-card-200 !text-card-800 !border-zinc-800/10 dark:!bg-card-800 dark:!text-card-100 dark:!border-zinc-100/20`,
      }}
      visibleToasts={10}
      richColors
      closeButton
    />
  );
}
