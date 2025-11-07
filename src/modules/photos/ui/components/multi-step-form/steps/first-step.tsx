import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import BlurImage from "@/components/blur-image";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, Check, ArrowRight } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { PhotoUploader } from "../../photo-uploader";
import { keyToImage } from "@/lib/keyToImage";
import { firstStepSchema, FirstStepData, UploadStepProps } from "../types";

export function FirstStep({
  url,
  imageInfo,
  onUploadSuccess,
  onReupload,
  onNext,
  initialData,
}: UploadStepProps) {
  const [isCopied, setIsCopied] = useState(false);

  const form = useForm<FirstStepData>({
    resolver: zodResolver(firstStepSchema),
    defaultValues: {
      url: initialData?.url || "",
    },
    mode: "onChange",
  });

  const { handleSubmit } = form;

  const handleCopyUrl = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(keyToImage(url));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const onSubmit = (data: FirstStepData) => {
    onNext(data);
  };

  const isStepValid = !!url;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          {!url || !imageInfo ? (
            <>
              <PhotoUploader
                folder="my-photos"
                onUploadSuccess={(url, exif, imageInfo) => {
                  onUploadSuccess(url, exif, imageInfo);
                  form.setValue("url", url, { shouldValidate: true });
                }}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ fieldState }) => (
                  <FormItem>{fieldState.error && <FormMessage />}</FormItem>
                )}
              />
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Photo uploaded successfully</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onReupload}
                >
                  Re-upload
                </Button>
              </div>

              {/* Image preview */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                <BlurImage
                  blurhash={imageInfo.blurhash}
                  src={keyToImage(url)}
                  alt="Uploaded photo"
                  fill
                  className="object-contain w-full h-full"
                  unoptimized
                />
              </div>

              {/* URL with copy button */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL</label>
                <InputGroup>
                  <InputGroupInput
                    value={keyToImage(url)}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      onClick={handleCopyUrl}
                      size="icon-xs"
                      aria-label="Copy URL"
                    >
                      {isCopied ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={!isStepValid}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
