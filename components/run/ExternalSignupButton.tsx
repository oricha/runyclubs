import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { es } from "@/lib/i18n/es";

export function ExternalSignupButton({ url }: { url: string }) {
  return (
    <div className="space-y-2">
      <Button className="w-full" asChild>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {es.runDetail.externalSignup}
          <ExternalLink className="h-4 w-4" />
        </a>
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {es.runDetail.externalSignupNote}
      </p>
    </div>
  );
}
