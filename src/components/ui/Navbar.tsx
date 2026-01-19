"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Newspaper, Search, Menu, X } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories } = trpc.category.getAll.useQuery();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="bg-[#B80000] text-white sticky top-0 z-50">
      {/* Top Bar */}
      <div className="border-b border-red-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded">
                <Newspaper className="w-6 h-6 text-[#B80000]" />
              </div>
              <span className="text-2xl font-bold">Lucent News</span>
            </Link>

            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 hover:bg-red-700 rounded-lg transition"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            <button
              className="md:hidden p-2 hover:bg-red-700 rounded-lg transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="border-b border-red-700 bg-red-800">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="flex-1 px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-2 bg-white text-[#B80000] rounded-lg font-medium hover:bg-gray-100 transition"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Category Navigation */}
      <nav className="hidden md:block bg-[#222]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 h-12 overflow-x-auto">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium hover:bg-gray-700 rounded transition whitespace-nowrap"
            >
              Home
            </Link>
            {categories?.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="px-4 py-2 text-sm font-medium hover:bg-gray-700 rounded transition whitespace-nowrap"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#222] border-t border-gray-700">
          <div className="px-4 py-2">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 px-3 py-2 rounded text-gray-900 text-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#B80000] rounded font-medium text-sm"
                >
                  Search
                </button>
              </div>
            </form>
            <div className="flex flex-col">
              <Link
                href="/"
                className="px-3 py-2 text-sm hover:bg-gray-700 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {categories?.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="px-3 py-2 text-sm hover:bg-gray-700 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
