"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { es } from "@/lib/i18n/es";
import { MIN_QUERY_LENGTH, type SearchResultItem } from "@/types/search";

type SearchState = "idle" | "loading" | "results" | "empty";

interface SearchRequest {
  query: string;
  items: SearchResultItem[];
}

function resolveSearchState(
  debouncedQuery: string,
  request: SearchRequest,
): SearchState {
  if (debouncedQuery.length < MIN_QUERY_LENGTH) return "idle";
  if (debouncedQuery !== request.query) return "loading";
  if (request.items.length > 0) return "results";
  return "empty";
}

/**
 * Modal de búsqueda global (⌘K) con debounce y resultados mixtos de clubs y carreras.
 */
export function SearchModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [request, setRequest] = useState<SearchRequest>({ query: "", items: [] });

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setQuery("");
        setDebouncedQuery("");
        setRequest({ query: "", items: [] });
      }
      onOpenChange(next);
    },
    [onOpenChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 200);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      return;
    }

    const controller = new AbortController();
    const queryAtStart = debouncedQuery;

    fetch(`/api/search?q=${encodeURIComponent(queryAtStart)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Search failed");
        return res.json() as Promise<{ items: SearchResultItem[] }>;
      })
      .then((data) => {
        setRequest({ query: queryAtStart, items: data.items });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setRequest({ query: queryAtStart, items: [] });
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  const state = resolveSearchState(debouncedQuery, request);

  function handleSelect(href: string) {
    handleOpenChange(false);
    router.push(href);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0">
        <DialogTitle className="sr-only">{es.nav.search}</DialogTitle>
        <DialogDescription className="sr-only">{es.home.searchPlaceholder}</DialogDescription>
        <div className="flex items-center gap-3 border-b border-border px-4 py-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={es.home.searchPlaceholder}
            className="border-none p-0 shadow-none focus-visible:ring-0"
          />
        </div>

        {state === "idle" && (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            {es.search.startTyping}
          </p>
        )}

        {state === "loading" && (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            {es.search.searching}
          </p>
        )}

        {state === "empty" && (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            {es.search.noResults}
          </p>
        )}

        {state === "results" && (
          <ul className="max-h-80 overflow-y-auto py-2">
            {request.items.map((item) => (
              <li key={`${item.kind}-${item.id}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(item.href)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-muted/50"
                >
                  <span className="mt-0.5 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {item.kind}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{item.title}</span>
                    {item.subtitle && (
                      <span className="block truncate text-sm text-muted-foreground">
                        {item.subtitle}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
