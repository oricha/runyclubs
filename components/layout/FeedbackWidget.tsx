"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { es } from "@/lib/i18n/es";

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message) return;
    setSent(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={es.feedback.triggerLabel}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm text-primary-foreground shadow-lg hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <MessageCircle size={16} />
        {es.feedback.triggerLabel}
      </button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setSent(false);
            setMessage("");
          }
        }}
      >
        <DialogContent className="p-6">
          <DialogTitle>{es.feedback.title}</DialogTitle>
          <DialogDescription>{es.feedback.description}</DialogDescription>
          {sent ? (
            <p className="mt-4 text-sm text-foreground">¡Gracias por tu sugerencia!</p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={es.feedback.placeholder}
                rows={4}
                className="w-full rounded-lg border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button type="submit" className="self-end">
                {es.feedback.send}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
