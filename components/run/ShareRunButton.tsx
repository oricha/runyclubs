"use client";

import { useCallback, useState } from "react";
import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { es } from "@/lib/i18n/es";

export function ShareRunButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Usuario canceló o share falló — fallback a clipboard
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [title, url]);

  return (
    <Button variant="outline" className="w-full" onClick={handleShare}>
      <Share2 className="h-4 w-4" />
      {copied ? es.runDetail.linkCopied : es.runDetail.shareRun}
    </Button>
  );
}
