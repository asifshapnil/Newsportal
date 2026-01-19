"use client";

import { trpc } from "@/lib/trpc";
import { ArticleCard } from "@/components/ui/ArticleCard";
import Link from "next/link";
import { Loader2, TrendingUp, Clock } from "lucide-react";

export default function HomePage() {
  const { data, isLoading } = trpc.article.getLatest.useQuery({ limit: 13 });
  const { data: categories } = trpc.category.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#B80000]" />
      </div>
    );
  }

  const articles = data?.articles || [];
  const featuredArticle = articles[0];
  const trendingArticles = articles.slice(1, 5);
  const recentArticles = articles.slice(5);

  return (
    <div>
      {/* Hero Section */}
      {featuredArticle && (
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Featured Article */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-[#B80000] text-white text-xs font-bold px-3 py-1 rounded">
                    BREAKING
                  </span>
                  <span className="text-gray-500 text-sm">Top Story</span>
                </div>
                <ArticleCard article={featuredArticle} variant="featured" />
              </div>

              {/* Trending Sidebar */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-[#B80000]" />
                  <h2 className="font-bold text-gray-900">Trending Now</h2>
                </div>
                <div className="space-y-4">
                  {trendingArticles.map((article, index) => (
                    <div key={article.id} className="flex gap-3">
                      <span className="text-2xl font-bold text-gray-300">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1">
                        <Link
                          href={`/article/${article.slug}`}
                          className="font-medium text-gray-900 hover:text-[#B80000] transition line-clamp-2 text-sm"
                        >
                          {article.title}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">
                          {article.category.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories Quick Links */}
      {categories && categories.length > 0 && (
        <section className="bg-[#222] py-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              <span className="text-white text-sm font-medium whitespace-nowrap">
                Explore:
              </span>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="px-4 py-1.5 bg-gray-700 text-white text-sm rounded-full hover:bg-[#B80000] transition whitespace-nowrap"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Articles Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#B80000]" />
              <h2 className="text-xl font-bold text-gray-900">Latest News</h2>
            </div>
          </div>

          {recentArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No more articles to display
            </div>
          )}
        </div>
      </section>

      {/* Category Sections */}
      {categories?.slice(0, 3).map((category) => (
        <CategorySection key={category.id} categorySlug={category.slug} />
      ))}
    </div>
  );
}

function CategorySection({ categorySlug }: { categorySlug: string }) {
  const { data } = trpc.article.getByCategory.useQuery({
    categorySlug,
    limit: 4,
  });

  if (!data || data.articles.length === 0) return null;

  return (
    <section className="py-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{data.category.name}</h2>
          <Link
            href={`/category/${categorySlug}`}
            className="text-sm text-[#B80000] hover:underline font-medium"
          >
            View All &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
