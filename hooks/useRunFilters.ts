"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ViewMode } from "@/components/common/ViewToggle";

export function useRunFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const toggle = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      const current = next.getAll(key);
      if (current.includes(value)) {
        next.delete(key);
        current.filter((v) => v !== value).forEach((v) => next.append(key, v));
      } else {
        next.append(key, value);
      }
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const setSingle = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      next.delete(key);
      if (value) next.set(key, value);
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const setView = useCallback(
    (view: ViewMode) => {
      const next = new URLSearchParams(params.toString());
      if (view === "list") {
        next.delete("view");
      } else {
        next.set("view", view);
      }
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const clearAll = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  const view: ViewMode = params.get("view") === "grid" ? "grid" : "list";

  return { params, toggle, setSingle, setView, clearAll, view };
}
