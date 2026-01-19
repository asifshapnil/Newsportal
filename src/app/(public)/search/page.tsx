"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Loader2, Search } from "lucide-react";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data: articles, isLoading } = trpc.article.search.useQuery(
    { query, limit: 20 },
    { enabled: query.length > 0 }
  );

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#B80000] p-2 rounded-lg">
            <Search className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
        </div>
        {query && (
          <p className="text-gray-600 mt-2">
            Showing results for: <span className="font-semibold">"{query}"</span>
          </p>
        )}
      </div>

      {!query ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Enter a search term to find articles.</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#B80000]" />
        </div>
      ) : articles && articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">No articles found for "{query}"</p>
          <p className="text-sm text-gray-400">Try different keywords</p>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#B80000]" />
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </div>
  );
}
