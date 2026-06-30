import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CityFaq } from "@/lib/city-page";
import { es } from "@/lib/i18n/es";

export function CityFaqSection({ faqs }: { faqs: CityFaq[] }) {
  return (
    <section className="mt-16">
      <h2 className="font-serif text-2xl">{es.cityPage.faqTitle}</h2>
      <Accordion type="single" collapsible className="mt-4">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`faq-${index}`}>
            <AccordionTrigger>{faq.q}</AccordionTrigger>
            <AccordionContent>{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
