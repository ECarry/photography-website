"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { postFormSchema } from "../../schemas";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PostGetOne } from "../../types";
import { generateSlug } from "../../lib/utils";
import { useEffect, useRef, useState } from "react";
import FileUploader from "@/modules/s3/ui/components/file-uploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagsInput } from "./tags-input";
import { ArrowLeft, Check, FileText, Loader2, Save } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const TiptapEditor = dynamic(() => import("@/components/editor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-96 animate-pulse rounded-md bg-[#F2F2F2] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#262626]" />
  ),
});

const formSchema = postFormSchema;

interface PostFormProps {
  post?: PostGetOne;
}

const getFormValues = (post?: PostGetOne): z.infer<typeof formSchema> => ({
  title: post?.title || "",
  slug: post?.slug || "",
  content: post?.content || "",
  visibility: post?.visibility || "private",
  coverImage: post?.coverImage || "",
  tags: post?.tags || [],
  description: post?.description || "",
});

export const PostForm = ({ post }: PostFormProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [contentUploading, setContentUploading] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getFormValues(post),
  });

  const createPost = useMutation(
    trpc.posts.create.mutationOptions({
      onSuccess: async (data) => {
        form.reset(getFormValues(data));
        setHasSaved(true);
        toast.success("Post created successfully");
        await queryClient.invalidateQueries(trpc.posts.getMany.queryFilter());
        await queryClient.invalidateQueries(trpc.blog.getMany.queryFilter());
        router.replace(`/dashboard/posts/${data.slug}`);
      },
      onError: (e) => {
        toast.error("Failed to create post", { description: e.message });
      },
    }),
  );

  const updatePost = useMutation(
    trpc.posts.update.mutationOptions({
      onSuccess: async (data) => {
        form.reset(getFormValues(data));
        setHasSaved(true);
        toast.success("Post updated successfully");
        queryClient.setQueryData(trpc.posts.getOne.queryKey({ slug: data.slug }), data);
        if (data.slug !== post?.slug) router.replace(`/dashboard/posts/${data.slug}`);
        await queryClient.invalidateQueries(trpc.posts.getMany.queryFilter());
        await queryClient.invalidateQueries(trpc.blog.getMany.queryFilter());
        await queryClient.invalidateQueries(trpc.blog.getOne.queryFilter());
      },
      onError: (e) => {
        toast.error("Failed to update post", { description: e.message });
      },
    }),
  );

  const isPending = createPost.isPending || updatePost.isPending;
  const isUploading = coverUploading || contentUploading;
  const isDirty = form.formState.isDirty;
  const visibility = useWatch({ control: form.control, name: "visibility" });

  useEffect(() => {
    if (!isDirty && !isUploading) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, isUploading]);

  useEffect(() => {
    const handleSave = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!isPending && !isUploading) formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", handleSave);
    return () => window.removeEventListener("keydown", handleSave);
  }, [isPending, isUploading]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isPending || isUploading) return;
    if (post) {
      updatePost.mutate({ ...values, id: post.id });
    } else {
      createPost.mutate(values);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Back to posts"
            disabled={isPending || isUploading}
            onClick={() => {
              if (!isDirty || window.confirm("Discard unsaved changes and return to posts?")) {
                router.push("/dashboard/posts");
              }
            }}
            className="size-9 rounded-md text-[#4D4D4D] hover:bg-[#EBEBEB] hover:text-[#171717] dark:text-[#B3B3B3] dark:hover:bg-[#262626] dark:hover:text-[#FAFAFA]"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-xs font-medium tracking-[0.08em] text-[#8F8F8F]">
              JOURNAL
            </p>
            <h1 className="mt-1 text-[28px] font-semibold leading-9 tracking-[-1.12px] text-[#171717] dark:text-[#FAFAFA] sm:text-[32px] sm:leading-10 sm:tracking-[-1.28px]">
              {post ? "Edit story" : "New story"}
            </h1>
            <p className="mt-1 text-sm text-[#4D4D4D] dark:text-[#B3B3B3]">
              A space for the stories behind your photographs.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 text-xs text-[#4D4D4D] dark:text-[#B3B3B3]">
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${
              visibility === "public" ? "bg-[#398E4A]" : "bg-[#8F8F8F]"
            }`}
          />
          {visibility === "public" ? "Public on save" : "Private draft"}
        </span>
      </div>
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit)}
          className="[&_input]:border-0 [&_input]:bg-[#FAFAFA] [&_input]:shadow-[0_0_0_1px_rgba(0,0,0,0.08)] [&_input]:focus-visible:ring-0 [&_textarea]:border-0 [&_textarea]:bg-[#FAFAFA] [&_textarea]:shadow-[0_0_0_1px_rgba(0,0,0,0.08)] [&_textarea]:focus-visible:ring-0 dark:[&_input]:bg-[#0A0A0A] dark:[&_textarea]:bg-[#0A0A0A]"
        >
          <fieldset disabled={isPending} className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-6">
              <div className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717] sm:p-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Story title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Give your story a title…"
                          className="h-auto border-0 bg-transparent px-0 py-3 text-[24px] font-semibold tracking-[-0.8px] shadow-none focus-visible:ring-0 md:text-[28px]"
                          {...field}
                          onChange={(event) => {
                            const slug = form.getValues("slug");
                            if (!post && (!slug || slug === generateSlug(field.value))) {
                              form.setValue("slug", generateSlug(event.target.value), { shouldDirty: true });
                            }
                            field.onChange(event);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717] sm:p-6 [&_.story-editor]:rounded-md [&_.story-editor]:border-0 [&_.story-editor]:shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="min-w-0 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-[#171717] dark:text-[#FAFAFA]">
                          <FileText className="size-4 text-[#8F8F8F]" />
                          Story content
                        </FormLabel>
                        <span className="hidden text-xs text-[#8F8F8F] sm:inline">
                          Select text to format
                        </span>
                      </div>
                      <TiptapEditor
                        content={field.value || ""}
                        onChange={field.onChange}
                        disabled={isPending}
                        onUploadStateChange={setContentUploading}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            {/* Right Form Section */}
            <aside className="min-w-0 space-y-4 xl:sticky xl:top-20">
              <div className="space-y-5 rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
                <div>
                  <h2 className="text-[14px] font-medium tracking-[-0.28px] text-[#171717] dark:text-[#FAFAFA]">
                    Publishing
                  </h2>
                  <p className="mt-1 text-xs text-[#8F8F8F]">
                    Choose when your story is ready to be seen.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-[#4D4D4D] dark:text-[#B3B3B3]">
                        Visibility
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full border-0 bg-[#FAFAFA] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#0A0A0A]">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="private">Private · only you</SelectItem>
                          <SelectItem value="public">Public · everyone</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="h-10 w-full rounded-md bg-[#0072F5] text-sm font-medium text-white shadow-none hover:bg-[#005FCC]"
                  disabled={isPending || isUploading}
                >
                  {isPending || isUploading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {isPending ? "Saving…" : isUploading ? "Waiting for image upload…" : post ? "Save changes" : visibility === "private" ? "Save draft" : "Publish story"}
                </Button>
                <div role="status" className="flex items-center justify-center gap-1.5 text-xs text-[#8F8F8F]">
                  {isDirty ? "Unsaved changes" : hasSaved ? <><Check className="size-3.5" /> All changes saved</> : post ? "No unsaved changes" : "Not saved yet"}
                  <span aria-hidden="true">·</span><span>⌘ / Ctrl + S</span>
                </div>
              </div>
              <div className="space-y-5 rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
                <h2 className="text-[14px] font-medium tracking-[-0.28px] text-[#171717] dark:text-[#FAFAFA]">
                  Story details
                </h2>
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover image</FormLabel>
                      <FileUploader
                        onUploadSuccess={field.onChange}
                        onUploadStateChange={setCoverUploading}
                        onRemove={() => field.onChange("")}
                        disabled={isPending}
                        folder="posts"
                        value={field.value}
                      />
                      <FormDescription className="text-xs text-[#8F8F8F]">
                        The first impression of your story.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl><Textarea placeholder="A short introduction to your story…" className="min-h-24 resize-y" {...field} /></FormControl>
                      <FormDescription className="text-xs text-[#8F8F8F]">
                        A brief summary for your readers.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL slug</FormLabel>
                      <FormControl><Input placeholder="your-story-url" {...field} /></FormControl>
                      <FormDescription className="break-all font-mono text-xs text-[#8F8F8F]">
                        /blog/{field.value || "your-story-url"}
                        {post && " · Changing this will change the article link."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <TagsInput value={field.value} onChange={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </aside>
          </fieldset>
        </form>
      </Form>
    </div>
  );
};
