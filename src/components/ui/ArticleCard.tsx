import Link from "next/link";
import { Clock } from "lucide-react";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    featuredImage: string | null;
    publishedAt: Date | null;
    category: {
      name: string;
      slug: string;
    };
  };
  variant?: "default" | "featured" | "horizontal";
}

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  if (variant === "featured") {
    return (
      <Link href={`/article/${article.slug}`} className="group block">
        <article className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
          {article.featuredImage ? (
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gray-300" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <Link
              href={`/category/${article.category.slug}`}
              className="inline-block px-3 py-1 bg-[#B80000] text-white text-xs font-medium rounded mb-3"
              onClick={(e) => e.stopPropagation()}
            >
              {article.category.name}
            </Link>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:underline">
              {article.title}
            </h2>
            <p className="text-gray-200 text-sm line-clamp-2 mb-3">{article.summary}</p>
            <div className="flex items-center gap-2 text-gray-300 text-xs">
              <Clock className="w-3 h-3" />
              {formattedDate}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link href={`/article/${article.slug}`} className="group block">
        <article className="flex gap-4">
          <div className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
            {article.featuredImage ? (
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#B80000] transition">
              {article.title}
            </h3>
            <div className="flex items-center gap-2 text-gray-500 text-xs mt-2">
              <Clock className="w-3 h-3" />
              {formattedDate}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/article/${article.slug}`} className="group block">
      <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
        <div className="aspect-video overflow-hidden">
          {article.featuredImage ? (
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
        <div className="p-4">
          <Link
            href={`/category/${article.category.slug}`}
            className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded mb-2 hover:bg-[#B80000] hover:text-white transition"
            onClick={(e) => e.stopPropagation()}
          >
            {article.category.name}
          </Link>
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#B80000] transition mb-2">
            {article.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{article.summary}</p>
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <Clock className="w-3 h-3" />
            {formattedDate}
          </div>
        </div>
      </article>
    </Link>
  );
}
