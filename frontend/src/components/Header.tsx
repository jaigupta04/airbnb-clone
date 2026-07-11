"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Menu, Moon, Sun, Heart, User, LayoutGrid, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export default function Header() {
  const { user, logout, mounted } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [where, setWhere] = useState("");
  const [when, setWhen] = useState("");

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function doSearch() {
    const params = new URLSearchParams();
    if (where) params.set("city", where);
    router.push(`/?${params.toString()}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/90 backdrop-blur-md dark:bg-neutral-900/90">
      <div className="mx-auto flex max-w-[1760px] items-center justify-between px-6 py-3 lg:px-10">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-1.5 text-rose-500">
          <svg viewBox="0 0 32 32" className="h-8 w-8" fill="currentColor" aria-hidden>
            <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.91 3.268 0 3.087-2.43 5.5-5.5 5.5-2.026 0-3.778-1.107-4.895-2.99l-.534-1.025c-.646-1.27-1.894-3.167-2.61-4.145l-.318-.43-.318.43c-.716.978-1.964 2.875-2.61 4.145l-.534 1.025C11.778 27.893 10.026 29 8 29c-3.07 0-5.5-2.413-5.5-5.5 0-.795.243-1.677.91-3.268l.145-.353c.986-2.297 5.146-11.007 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.053.539-2.987 2.21l-.533 1.025c-1.954 3.83-6.114 12.54-7.1 14.836l-.145.353c-.591 1.412-.765 1.97-.765 2.566 0 1.933 1.567 3.5 3.5 3.5 1.14 0 2.115-.595 2.762-1.695l.315-.6c.343-.674 1.038-1.836 1.757-2.817l.318-.43c1.055-1.44 2.072-2.455 3.278-2.455s2.223 1.014 3.278 2.455l.318.43c.719.98 1.414 2.143 1.757 2.817l.315.6c.647 1.1 1.622 1.695 2.762 1.695 1.933 0 3.5-1.567 3.5-3.5 0-.597-.174-1.554-.765-2.566l-.145-.353c-.986-2.297-5.146-11.007-7.1-14.836l-.533-1.025C18.053 3.54 17.239 3 16 3z"/>
          </svg>
          <span className="hidden text-xl font-bold tracking-tight md:inline">airbnb</span>
        </Link>

        {/* Center search pill */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-2 pl-5 pr-2 text-sm shadow-sm transition hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
        >
          <span className="font-medium">Anywhere</span>
          <span className="h-5 w-px bg-neutral-200 dark:bg-neutral-600" />
          <span className="font-medium text-neutral-500 dark:text-neutral-400">Any week</span>
          <span className="h-5 w-px bg-neutral-200 dark:bg-neutral-600" />
          <span className="text-neutral-400">Add guests</span>
          <span className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white">
            <Search className="h-4 w-4" />
          </span>
        </button>

        {/* Right menu */}
        <div className="flex items-center gap-2">
          <Link
            href="/host"
            className="hidden rounded-full px-3 py-2.5 text-sm font-medium hover:bg-neutral-100 md:inline dark:hover:bg-neutral-800"
          >
            Become a host / Dashboard
          </Link>
          <button
            onClick={toggle}
            className="rounded-full p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-2 pl-3 pr-2 shadow-sm transition hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
            >
              <Menu className="h-4 w-4" />
              <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-neutral-700 text-white">
                {user && user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-14 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white py-2 shadow-xl animate-fadein dark:border-neutral-700 dark:bg-neutral-800">
                {mounted && user ? (
                  <>
                    <div className="px-4 py-2">
                      <p className="font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-neutral-500">{user.email}</p>
                    </div>
                    <div className="my-1 h-px bg-neutral-100 dark:bg-neutral-700" />
                    <Link href="/trips" className={menuLink} onClick={() => setMenuOpen(false)}>
                      <Home className="mr-2 h-4 w-4" /> My trips
                    </Link>
                    <Link href="/wishlist" className={menuLink} onClick={() => setMenuOpen(false)}>
                      <Heart className="mr-2 h-4 w-4" /> Wishlist
                    </Link>
                    <Link href="/host" className={menuLink} onClick={() => setMenuOpen(false)}>
                      <LayoutGrid className="mr-2 h-4 w-4" /> Host dashboard
                    </Link>
                    <div className="my-1 h-px bg-neutral-100 dark:bg-neutral-700" />
                    <button onClick={() => { logout(); setMenuOpen(false); router.push("/"); }} className={cn(menuLink, "w-full text-left")}>
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className={menuLink} onClick={() => setMenuOpen(false)}>Log in</Link>
                    <Link href="/signup" className={menuLink} onClick={() => setMenuOpen(false)}>Sign up</Link>
                    <div className="my-1 h-px bg-neutral-100 dark:bg-neutral-700" />
                    <Link href="/host" className={menuLink} onClick={() => setMenuOpen(false)}>Become a host</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

const menuLink =
  "block px-4 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700";