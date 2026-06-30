"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export function FilterAccordion({
  title,
  count,
  value,
  children,
  className,
}: {
  title: string;
  count?: number;
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Accordion type="single" collapsible className={cn("w-full", className)}>
      <AccordionItem value={value} className="border-b border-border">
        <AccordionTrigger className="py-3 hover:no-underline">
          <span className="flex items-center gap-2">
            {title}
            {count ? (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-normal text-muted-foreground">
                {count}
              </span>
            ) : null}
          </span>
        </AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
