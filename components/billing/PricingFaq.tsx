"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { es } from "@/lib/i18n/es";

export function PricingFaq() {
  const items = [
    { q: es.billing.faqCancelAnytime, a: es.billing.faqCancelAnytimeAnswer },
    { q: es.billing.faqCommitment, a: es.billing.faqCommitmentAnswer },
    { q: es.billing.faqAfterCancel, a: es.billing.faqAfterCancelAnswer },
  ];

  return (
    <Accordion type="single" collapsible className="w-full max-w-2xl">
      {items.map((item, index) => (
        <AccordionItem key={item.q} value={`item-${index}`}>
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent>{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
