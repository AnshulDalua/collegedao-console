import S3 from "aws-sdk/clients/s3";
import { toast } from "sonner";
import useSWR from "swr";
import { match } from "ts-pattern";
import { MouseEventHandler, useMemo, useRef, useState } from "react";

import Modaler from "@/components/reusables/modaler";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useCredentials } from "@/hooks/useCredentials";
import { useWRC } from "@/hooks/useWRC";
import { useModal } from "@/stores/modal";

import type { ResponseData as ServicesStorageInfoAWSData } from "@/pages/api/services/storage/aws/info";

type BucketInfo = ServicesStorageInfoAWSData;

export default function StorageConnect() {
  const [open, setOpen, data] = useModal("connect", "storage");
  const credentials = useCredentials(data.id);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [file, setFile] = useState<File[] | null>(null);
  const [upload, setUpload] = useState<S3.ManagedUpload | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const { data: bucket } = useWRC<BucketInfo>(
    "/api/services/storage/aws/info",
    (chain) => chain.query({ stackId: data.id }),
    { key: "bucket" + data.id }
  );

  const s3 = useMemo(
    () => (open && credentials ? new S3(credentials) : null),
    [credentials, open]
  );

  const { data: bucketObjects, mutate } = useSWR(
    [`bucketList` + bucket?.bucketName, open],
    async () => {
      if (!open || !credentials || !s3 || !bucket?.bucketName) return null;
      return s3
        .listObjectsV2({ Bucket: bucket.bucketName })
        .promise()
        .then((res) => res.Contents);
    },
    { refreshInterval: 1000 }
  );

  const handleUpload: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    if (!file || !bucket?.bucketName) return;

    for (const f of file) {
      const params = {
        Bucket: bucket.bucketName,
        Key: f.name,
        Body: f,
      };

      try {
        if (!s3) return;
        const upload = s3.upload(params);
        setUpload(upload);
        upload.on("httpUploadProgress", (p) => {
          setProgress(p.loaded / p.total);
        });
        await upload.promise();

        toast.success(`File ${f.name} uploaded successfully!`);
        mutate();
        setProgress(0);
        setUpload(null);
      } catch (err) {
        toast.error(`Failed to upload ${f.name}.`);
      }
    }
    setTimeout(() => {
      setUpload(null);
    }, 1000);
  };

  const handleDelete = async (Key: string) => {
    if (!s3 || !bucket?.bucketName) return null;
    const del = s3.deleteObject({ Bucket: bucket.bucketName, Key: Key });

    toast.promise(del.promise(), {
      loading: `Deleting ${Key}...`,
      success: `Deleted ${Key} successfully!`,
      error: "Failed to delete.",
    });
    mutate();
  };

  return (
    <Modaler set={setOpen} open={open}>
      {match(data.provider)
        .with("gcp", () => (
          <div>Connecting to Google Cloud Storage is not yet supported.</div>
        ))
        .with("aws", () => (
          <div className="flex flex-col items-center">
            <main>
              <div className="flex flex-col gap-4 rounded p-4">
                <h1 className="text-2xl font-bold">Bucket Objects</h1>
                <ScrollArea>
                  <ul className="flex h-full max-h-96 flex-col gap-2">
                    {bucketObjects?.map((object) => (
                      <li key={object.Key} className="flex">
                        <HoverCard openDelay={100} closeDelay={100}>
                          <HoverCardTrigger>
                            <Button
                              onClick={() =>
                                window.open(
                                  `https://${bucket?.bucketName}.s3.amazonaws.com/${object.Key}`
                                )
                              }
                              variant="link"
                            >
                              {object.Key}
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent
                            className="w-[220px] p-4 "
                            side="right"
                            hideWhenDetached
                          >
                            <div className="flex flex-col">
                              <span className="text-muted-background text-sm">
                                {object.Size} bytes
                              </span>{" "}
                              <span className="text-muted-background text-sm">
                                Last modified:{" "}
                                {object.LastModified?.toLocaleString()}
                              </span>{" "}
                              <span className="text-muted-background text-sm">
                                Storage class: {object.StorageClass}
                              </span>
                              <Button
                                onClick={() => handleDelete(object.Key ?? "")}
                                size={"sm"}
                                className="mt-2 bg-red-500 text-white hover:bg-red-600"
                              >
                                Delete
                              </Button>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </li>
                    ))}
                  </ul>
                  <ScrollBar />
                </ScrollArea>
              </div>
              <form
                className="flex flex-col gap-4 rounded p-10 text-white shadow"
                ref={formRef}
              >
                <Input
                  type="file"
                  onChange={(e) => {
                    e.preventDefault();
                    if (!e.target.files) return;
                    setFile(Array.from(e.target.files));
                  }}
                  multiple
                />
                <Button
                  className="bg-green-500 text-white hover:bg-green-600"
                  onClick={handleUpload}
                >
                  Upload
                </Button>
                {upload && (
                  <>
                    <button
                      className="rounded bg-red-500 p-2 shadow"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!upload) return;
                        upload.abort();
                        setProgress(0);
                        setUpload(null);
                      }}
                    >
                      Cancel
                    </button>
                    <Progress value={progress * 100} />
                  </>
                )}
              </form>
            </main>
          </div>
        ))
        .otherwise(() => null)}
    </Modaler>
  );
}
