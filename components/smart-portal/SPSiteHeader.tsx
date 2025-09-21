import Link from "next/link";
import { Menu, Search, Bell } from "lucide-react";

export default function SPSiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 text-gray-300 hover:bg-neutral-900">
            <Menu className="h-4 w-4" />
          </button>
          <Link href="/smart-portal" className="text-sm font-extrabold tracking-tight">
            SABQ Smart Portal
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden sm:inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-sm text-gray-300 hover:border-neutral-700">
            <Search className="h-4 w-4" />
            بحث
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 text-gray-300 hover:bg-neutral-900">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
