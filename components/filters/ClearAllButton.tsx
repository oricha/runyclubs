"use client";

import { Button } from "@/components/ui/button";
import { es } from "@/lib/i18n/es";

export function ClearAllButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="text-muted-foreground">
      {es.filters.clearAll}
    </Button>
  );
}
