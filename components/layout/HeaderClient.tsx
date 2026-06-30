"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Search, User } from "lucide-react";
import type { Session } from "next-auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { es } from "@/lib/i18n/es";
import { SearchModal } from "@/components/search/SearchModal";

function getInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "?";
}

export function HeaderClient({ session }: { session: Session | null }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const user = session?.user;
  const accountHref = user ? "/cuenta" : "/acceso";
  const accountLabel = user ? es.nav.account : es.nav.login;

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <nav
          className="pointer-events-auto flex items-center gap-6 rounded-full border border-border
                      bg-background/80 px-5 py-2.5 shadow-sm backdrop-blur-md"
        >
          <Link href="/" className="text-lg font-black tracking-tight">
            RUNCLUBS<sup className="text-[10px]">®</sup>
          </Link>
          <div className="hidden items-center gap-5 text-sm md:flex">
            <Link href="/carreras" className="hover:opacity-70">
              {es.nav.discover}
            </Link>
            <Link href="/clubs" className="hover:opacity-70">
              {es.nav.clubs}
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/calendarios"
              aria-label={es.nav.calendars}
              className="rounded-full p-2 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Calendar size={18} />
            </Link>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={es.nav.search}
              className="rounded-full p-2 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Search size={18} />
            </button>
            <Link
              href={accountHref}
              aria-label={accountLabel}
              className="rounded-full bg-secondary p-1 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {user ? (
                <Avatar className="h-7 w-7">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name ?? accountLabel} />
                  ) : null}
                  <AvatarFallback className="text-xs">
                    {getInitials(user.name, user.email)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <span className="flex h-7 w-7 items-center justify-center">
                  <User size={18} />
                </span>
              )}
            </Link>
          </div>
        </nav>
      </header>
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
