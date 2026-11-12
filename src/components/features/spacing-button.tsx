"use client";

import * as React from "react";
import { Loader2, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SpacingButton() {
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  async function run() {
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/spacing/run", { method: "POST" });
      const data = await res.json();
      setMessage(res.ok ? `${data.created} یادآوری ساخته شد` : (data.error ?? "خطا"));
    } catch {
      setMessage("ارتباط برقرار نشد");
    } finally {
      setPending(false);
      setTimeout(() => setMessage(null), 4000);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {message ? <span className="text-[11.5px] text-ink-faint">{message}</span> : null}
      <Button variant="secondary" size="sm" onClick={run} disabled={pending}>
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Repeat size={14} />}
        یادآوری برند
      </Button>
    </div>
  );
}
