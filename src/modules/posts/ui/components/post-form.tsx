import { useEffect } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { postInsertSchema } from "../../schemas";
import FileUploader from "@/modules/cloudflare/ui/components/file-uploader";

interface PostFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PostForm = ({ onSuccess, onCancel }: PostFormProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createPost = useMutation(
    trpc.posts.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.posts.getMany.queryOptions({})
        );
        toast.success("Post created successfully!");
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const form = useForm<z.infer<typeof postInsertSchema>>({
    resolver: zodResolver(postInsertSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      coverImage: undefined,
    },
  });

  const isPending = createPost.isPending;

  // Watch the title and content fields to update slug and reading time
  const title = form.watch("title");

  // Generate slug from title (supports Unicode)
  const generateSlug = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/&/g, "-and-") // Replace & with 'and'
      .replace(/[^\p{L}\p{N}\-]+/gu, "") // Keep Unicode letters, numbers, hyphens
      .replace(/\-\-+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start of text
      .replace(/-+$/, ""); // Trim - from end of text
  };

  // Update slug when title changes
  useEffect(() => {
    if (title) {
      const slug = generateSlug(title);
      form.setValue("slug", slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const onSubmit = (values: z.infer<typeof postInsertSchema>) => {
    createPost.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter post title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} placeholder="post-url-slug" disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image</FormLabel>
              <FormControl>
                <FileUploader
                  onUploadSuccess={(key) => {
                    field.onChange(key);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button
              variant="ghost"
              disabled={isPending}
              type="button"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
