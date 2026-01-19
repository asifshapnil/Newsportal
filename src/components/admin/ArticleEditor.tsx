"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "./ImageUpload";
import { RichTextEditor } from "./RichTextEditor";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  summary: z.string().min(1, "Summary is required"),
  content: z.string().min(1, "Content is required"),
  featuredImage: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleEditorProps {
  articleId?: string;
}

export function ArticleEditor({ articleId }: ArticleEditorProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [featuredImage, setFeaturedImage] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const { data: categories } = trpc.category.getAll.useQuery();
  const { data: article, isLoading: isLoadingArticle } = trpc.article.getById.useQuery(
    { id: articleId! },
    { enabled: !!articleId }
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      slug: "",
      summary: "",
      content: "",
      featuredImage: "",
      categoryId: "",
      status: "DRAFT",
    },
  });

  useEffect(() => {
    if (article) {
      reset({
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        content: article.content,
        featuredImage: article.featuredImage || "",
        categoryId: article.categoryId,
        status: article.status,
      });
      setFeaturedImage(article.featuredImage || "");
      setContent(article.content);
    }
  }, [article, reset]);

  const title = watch("title");

  useEffect(() => {
    if (!articleId && title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setValue("slug", slug);
    }
  }, [title, articleId, setValue]);

  // Sync content state with form
  useEffect(() => {
    setValue("content", content);
  }, [content, setValue]);

  const createMutation = trpc.article.create.useMutation({
    onSuccess: () => {
      utils.article.getAll.invalidate();
      router.push("/admin/articles");
    },
  });

  const updateMutation = trpc.article.update.useMutation({
    onSuccess: () => {
      utils.article.getAll.invalidate();
      utils.article.getById.invalidate({ id: articleId! });
      router.push("/admin/articles");
    },
  });

  const onSubmit = (data: ArticleFormData) => {
    const payload = {
      ...data,
      content,
      featuredImage: featuredImage || undefined,
    };

    if (articleId) {
      updateMutation.mutate({ id: articleId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  if (articleId && isLoadingArticle) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/articles"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {articleId ? "Edit Article" : "New Article"}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  {...register("title")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  placeholder="Enter article title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm mr-2">/article/</span>
                  <input
                    {...register("slug")}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    placeholder="article-slug"
                  />
                </div>
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary
                </label>
                <textarea
                  {...register("summary")}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Brief summary of the article"
                />
                {errors.summary && (
                  <p className="mt-1 text-sm text-red-600">{errors.summary.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Write your article content here..."
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Publish</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    {...register("status")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    {...register("categoryId")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">Select a category</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {articleId ? "Update" : "Publish"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Featured Image</h3>
              <ImageUpload
                value={featuredImage}
                onChange={setFeaturedImage}
                onRemove={() => setFeaturedImage("")}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
