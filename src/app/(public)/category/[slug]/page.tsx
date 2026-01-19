"use client";

import { use } from "react";
import { trpc } from "@/lib/trpc";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Loader2, FolderOpen } from "lucide-react";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data, isLoading, error } = trpc.article.getByCategory.useQuery({
    categorySlug: slug,
    limit: 20,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#B80000]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h1>
        <p className="text-gray-600">The category you're looking for doesn't exist.</p>
      </div>
    );
  }

  const { category, articles } = data!;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#B80000] p-2 rounded-lg">
            <FolderOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        </div>
        {category.description && (
          <p className="text-gray-600 mt-2">{category.description}</p>
        )}
        <div className="text-sm text-gray-500 mt-2">
          {articles.length} articles
        </div>
      </div>

      {/* Articles Grid */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No articles in this category yet.</p>
        </div>
      )}
    </div>
  );
}
