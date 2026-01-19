"use client";

import { use } from "react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { ArticleCard } from "@/components/ui/ArticleCard";
import {
  Loader2,
  Clock,
  User,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  ArrowLeft,
} from "lucide-react";

export default function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: article, isLoading, error } = trpc.article.getBySlug.useQuery({ slug });

  const { data: relatedArticles } = trpc.article.getRelated.useQuery(
    {
      articleId: article?.id || "",
      categoryId: article?.categoryId || "",
      limit: 4,
    },
    { enabled: !!article }
  );

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = article?.title || "";

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
      return;
    }

    window.open(shareUrls[platform], "_blank", "width=600,height=400");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#B80000]" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
        <p className="text-gray-600 mb-4">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/"
          className="text-[#B80000] hover:underline font-medium inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <article className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-[#B80000]">
              Home
            </Link>
            <span>/</span>
            <Link
              href={`/category/${article.category.slug}`}
              className="hover:text-[#B80000]"
            >
              {article.category.name}
            </Link>
          </nav>

          {/* Article Header */}
          <header className="mb-6">
            <Link
              href={`/category/${article.category.slug}`}
              className="inline-block px-3 py-1 bg-[#B80000] text-white text-xs font-medium rounded mb-4"
            >
              {article.category.name}
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>
            <p className="text-lg text-gray-600 mb-4">{article.summary}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {article.author.name}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formattedDate}
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {article.featuredImage && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Share Buttons */}
          <div className="flex items-center gap-2 mb-8 pb-4 border-b border-gray-200">
            <span className="text-sm text-gray-500 mr-2">Share:</span>
            <button
              onClick={() => handleShare("facebook")}
              className="p-2 bg-[#1877F2] text-white rounded-lg hover:opacity-90 transition"
              title="Share on Facebook"
            >
              <Facebook className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleShare("twitter")}
              className="p-2 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition"
              title="Share on Twitter"
            >
              <Twitter className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleShare("linkedin")}
              className="p-2 bg-[#0A66C2] text-white rounded-lg hover:opacity-90 transition"
              title="Share on LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleShare("copy")}
              className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              title="Copy link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-[#B80000] prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Related Articles */}
          {relatedArticles && relatedArticles.length > 0 && (
            <section className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <ArticleCard key={relatedArticle.id} article={relatedArticle} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            {/* Latest News */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Latest News
              </h3>
              <LatestArticlesSidebar currentArticleId={article.id} />
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Categories
              </h3>
              <CategoriesSidebar />
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}

function LatestArticlesSidebar({ currentArticleId }: { currentArticleId: string }) {
  const { data } = trpc.article.getLatest.useQuery({ limit: 5 });

  const articles = data?.articles.filter((a) => a.id !== currentArticleId).slice(0, 4);

  if (!articles?.length) return null;

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} variant="horizontal" />
      ))}
    </div>
  );
}

function CategoriesSidebar() {
  const { data: categories } = trpc.category.getAll.useQuery();

  if (!categories?.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-[#B80000] hover:text-white transition"
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
