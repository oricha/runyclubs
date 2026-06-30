"use client";

import { useState } from "react";

import { Container } from "@/components/common/Container";
import { SectionLabel } from "@/components/common/SectionLabel";
import { ViewToggle, type ViewMode } from "@/components/common/ViewToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { es } from "@/lib/i18n/es";

export default function Home() {
  const [view, setView] = useState<ViewMode>("list");

  return (
    <Container className="space-y-16 py-12">
      <section className="rounded-3xl border border-border bg-card px-6 py-16 text-center sm:px-10">
        <SectionLabel>Sistema de diseño</SectionLabel>
        <h1 className="mt-3 font-serif text-5xl leading-tight md:text-6xl">
          {es.home.heroTitlePre} <em className="italic">{es.home.heroTitleEm}</em>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">{es.home.heroSubtitle}</p>
        <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:flex-row">
          <Input placeholder={es.home.searchPlaceholder} />
          <Button className="shrink-0">{es.filters.findRuns}</Button>
        </div>
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span>{es.home.clubsCount.replace("{count}", "20")}</span>
          <span>{es.home.runsCount.replace("{count}", "120")}</span>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <SectionLabel>Componentes</SectionLabel>
            <h2 className="font-serif text-3xl">Botones</h2>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primario</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="outline">Borde</Button>
          <Button variant="ghost">Fantasma</Button>
          <Button variant="link">Enlace</Button>
          <Button variant="destructive">Destructivo</Button>
          <Button disabled>Deshabilitado</Button>
        </div>
      </section>

      <section className="space-y-4">
        <SectionLabel>Componentes</SectionLabel>
        <h2 className="font-serif text-3xl">Tarjetas, badges y avatares</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Retiro Morning Crew</CardTitle>
              <CardDescription>Madrid · 3x/semana · Todos los ritmos</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              <Badge>😊 Social</Badge>
              <Badge variant="outline">🏆 Fundadores</Badge>
              <div className="flex -space-x-2">
                <Avatar className="border-2 border-card">
                  <AvatarImage src="" alt="" />
                  <AvatarFallback>MR</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-card">
                  <AvatarImage src="" alt="" />
                  <AvatarFallback>JL</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-card">
                  <AvatarImage src="" alt="" />
                  <AvatarFallback>+8</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Vista lista / cuadrícula</CardTitle>
              <CardDescription>ViewToggle reutilizable en listados</CardDescription>
            </CardHeader>
            <CardContent>
              <ViewToggle value={view} onChange={setView} />
              <p className="mt-3 text-sm text-muted-foreground">
                Vista actual: <span className="font-medium text-foreground">{view}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <SectionLabel>Componentes</SectionLabel>
        <h2 className="font-serif text-3xl">Acordeón (FAQ)</h2>
        <Accordion type="single" collapsible className="max-w-2xl">
          <AccordionItem value="item-1">
            <AccordionTrigger>¿Necesito ser rápido para unirme a un club?</AccordionTrigger>
            <AccordionContent>
              Para nada. La mayoría de los clubs tienen grupos de distintos niveles.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>¿Cuánto cuesta correr con un club?</AccordionTrigger>
            <AccordionContent>
              La gran mayoría de clubs en RunClubs.es son gratuitos.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="space-y-4">
        <SectionLabel>Comprobación</SectionLabel>
        <h2 className="font-serif text-3xl">
          Pulsa <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-xs">⌘K</kbd>{" "}
          o el icono de búsqueda del header
        </h2>
        <p className="max-w-xl text-muted-foreground">
          Abre el modal de búsqueda para comprobar el componente <code>Dialog</code>. Usa el botón
          de sugerencias en la esquina inferior derecha para comprobar el <code>FeedbackWidget</code>.
        </p>
      </section>
    </Container>
  );
}
