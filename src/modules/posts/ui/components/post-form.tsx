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
import { Badge } from "@/components/ui/badge";
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
import { ArrowLeft, Check, FileText, Globe, Loader2, Lock, Save } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const TiptapEditor = dynamic(() => import("@/components/editor"), {
  ssr: false,
  loading: () => <div className="min-h-96 animate-pulse rounded-xl border bg-muted/30" />,
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
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Back to posts"
            disabled={isPending || isUploading}
            onClick={() => {
              if (!isDirty || window.confirm("Discard unsaved changes and return to posts?")) {
                router.push("/dashboard/posts");
              }
            }}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{post ? "Edit story" : "New story"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">A space for the stories behind your photographs.</p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1.5 px-3 py-1">
          {visibility === "public" ? <Globe className="size-3.5" /> : <Lock className="size-3.5" />}
          {visibility === "public" ? "Public on save" : "Private draft"}
        </Badge>
      </div>
      <Form {...form}>
        <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset disabled={isPending} className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-6">
              <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Story title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Give your story a title…"
                          className="h-auto border-0 bg-transparent px-0 py-3 text-2xl font-semibold shadow-none focus-visible:ring-0 md:text-3xl"
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
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="min-w-0 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <FormLabel className="flex items-center gap-2"><FileText className="size-4" /> Story content</FormLabel>
                      <span className="text-xs text-muted-foreground">Select text to format</span>
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
            {/* Right Form Section */}
            <aside className="min-w-0 space-y-5 xl:sticky xl:top-6">
              <div className="space-y-5 rounded-xl border bg-card p-5 shadow-sm">
                <div>
                  <h2 className="font-semibold">Publishing</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Choose when your story is ready to be seen.</p>
                </div>
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
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
                <Button type="submit" className="w-full" disabled={isPending || isUploading}>
                  {isPending || isUploading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {isPending ? "Saving…" : isUploading ? "Waiting for image upload…" : post ? "Save changes" : visibility === "private" ? "Save draft" : "Publish story"}
                </Button>
                <div role="status" className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  {isDirty ? "Unsaved changes" : hasSaved ? <><Check className="size-3.5" /> All changes saved</> : post ? "No unsaved changes" : "Not saved yet"}
                  <span aria-hidden="true">·</span><span>⌘ / Ctrl + S</span>
                </div>
              </div>
              <div className="space-y-5 rounded-xl border bg-card p-5 shadow-sm">
                <h2 className="font-semibold">Story details</h2>
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
                      <FormDescription>The first impression of your story.</FormDescription>
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
                      <FormDescription>A brief summary for your readers.</FormDescription>
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
                      <FormDescription className="break-all">/blog/{field.value || "your-story-url"}{post && " · Changing this will change the article link."}</FormDescription>
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
