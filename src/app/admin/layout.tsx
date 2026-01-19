"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  LogOut,
  Newspaper,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login?callbackUrl=/admin");
    } else if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded">
              <Newspaper className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold">Lucent News</span>
          </Link>
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="border-t border-gray-700 pt-4">
            <div className="px-3 mb-3">
              <p className="text-sm text-gray-400">Signed in as</p>
              <p className="text-white font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm h-16 flex items-center px-4 lg:px-6">
          <button
            className="lg:hidden text-gray-600 hover:text-gray-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="ml-4 lg:ml-0">
            <Link
              href="/"
              target="_blank"
              className="text-sm text-gray-600 hover:text-red-600 transition"
            >
              View Site &rarr;
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
