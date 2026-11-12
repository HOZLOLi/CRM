"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "motion/react";
import { Building2, GripVertical, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney, dec, sum } from "@/lib/money";
import { formatDate } from "@/lib/date";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input, Field, Select } from "@/components/ui/input";

export interface BoardDeal {
  id: string;
  title: string;
  amount: string;
  probability: number;
  status: string;
  expectedCloseDate: string | null;
  companyName: string | null;
  ownerName: string | null;
  ownerHue: number;
  stageId: string | null;
}

export interface BoardStage {
  id: string;
  name: string;
  order: number;
  probability: number;
  tone: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const TONE_BAR: Record<string, string> = {
  neutral: "bg-line-strong",
  turquoise: "bg-turquoise",
  saffron: "bg-saffron",
  moss: "bg-moss",
};

/* ------------------------------------------------------------------ card */

function DealCard({
  deal,
  dragging,
  onOpen,
}: {
  deal: BoardDeal;
  dragging?: boolean;
  onOpen?: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal.id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group relative rounded-[9px] border border-line bg-surface p-3",
        "transition-[border-color,box-shadow] duration-[var(--dur-2)] ease-[var(--ease-out-quart)]",
        "hover:border-line-strong hover:shadow-[var(--shadow-pop)]",
        (isDragging || dragging) && "opacity-40",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          onClick={onOpen}
          className="min-w-0 flex-1 cursor-grab text-right active:cursor-grabbing"
          aria-label={`معامله ${deal.title}`}
        >
          <p className="line-clamp-2 text-[13px] font-medium leading-5 text-ink">{deal.title}</p>
          {deal.companyName ? (
            <p className="mt-1 flex items-center gap-1 truncate text-[11.5px] text-ink-faint">
              <Building2 size={11} className="shrink-0" />
              {deal.companyName}
            </p>
          ) : null}
        </button>
        <GripVertical
          size={14}
          className="mt-0.5 shrink-0 text-line-strong opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="tnum text-[12.5px] font-medium text-ink">
          {formatMoney(deal.amount, { compact: true })}
        </span>
        {deal.ownerName ? (
          <Avatar name={deal.ownerName} hue={deal.ownerHue} size={20} />
        ) : null}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-turquoise/70"
            style={{ width: `${deal.probability}%` }}
          />
        </div>
        <span className="tnum text-[10.5px] text-ink-faint">
          {deal.probability.toLocaleString("fa-IR")}٪
        </span>
      </div>

      {deal.expectedCloseDate ? (
        <p className="mt-1.5 text-[10.5px] text-ink-faint">
          بستن: {formatDate(deal.expectedCloseDate, "d MMM")}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ column */

function StageColumn({
  stage,
  deals,
  onOpen,
}: {
  stage: BoardStage;
  deals: BoardDeal[];
  onOpen: (deal: BoardDeal) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const total = sum(deals.map((d) => d.amount));

  return (
    <div className="flex w-[264px] shrink-0 flex-col lg:w-auto lg:min-w-[210px] lg:flex-1">
      <div className="mb-2 flex items-baseline justify-between gap-2 px-0.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", TONE_BAR[stage.tone] ?? "bg-line-strong")} />
          <h3 className="truncate text-[12.5px] font-semibold text-ink">{stage.name}</h3>
          <span className="tnum text-[11px] text-ink-faint">
            {deals.length.toLocaleString("fa-IR")}
          </span>
        </div>
        <span className="tnum shrink-0 text-[11px] text-ink-faint">
          {formatMoney(total, { compact: true })}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[120px] flex-1 flex-col gap-2 rounded-[10px] border border-dashed p-2",
          "transition-colors duration-[var(--dur-2)]",
          isOver ? "border-turquoise bg-turquoise-soft/40" : "border-line bg-surface-2/40",
        )}
      >
        <AnimatePresence initial={false}>
          {deals.map((deal) => (
            <motion.div
              key={deal.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              <DealCard deal={deal} onOpen={() => onOpen(deal)} />
            </motion.div>
          ))}
        </AnimatePresence>

        {deals.length === 0 && (
          <p className="px-2 py-6 text-center text-[11.5px] text-ink-faint">خالی</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ board */

export function DealsBoard({
  stages,
  initialDeals,
  companies,
}: {
  stages: BoardStage[];
  initialDeals: BoardDeal[];
  companies: { id: string; name: string }[];
}) {
  const [deals, setDeals] = React.useState(initialDeals);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const activeDeal = deals.find((d) => d.id === activeId) ?? null;

  async function moveDeal(dealId: string, stageId: string) {
    const previous = deals;
    const stage = stages.find((s) => s.id === stageId);

    setDeals((current) =>
      current.map((d) =>
        d.id === dealId
          ? { ...d, stageId, probability: stage?.probability ?? d.probability }
          : d,
      ),
    );

    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setDeals(previous);
      setError("جابه‌جایی ذخیره نشد. دوباره تلاش کنید.");
      setTimeout(() => setError(null), 4000);
    }
  }

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const dealId = String(active.id);
    const overId = String(over.id);
    const targetStage = stages.some((s) => s.id === overId)
      ? overId
      : deals.find((d) => d.id === overId)?.stageId;

    if (!targetStage) return;
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stageId === targetStage) return;

    void moveDeal(dealId, targetStage);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="hidden text-[12.5px] text-ink-faint sm:block">
          کارت‌ها را بین مراحل بکشید — تغییر مرحله بلافاصله ذخیره می‌شود.
        </p>
        <Button size="sm" className="whitespace-nowrap" onClick={() => setCreating(true)}>
          <Plus size={15} />
          معامله جدید
        </Button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-[7px] bg-clay-soft px-3 py-2 text-[12.5px] text-clay"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 md:mx-0 md:px-0">
          {stages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              deals={deals.filter((d) => d.stageId === stage.id)}
              onOpen={() => {}}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.16,1,0.3,1)" }}>
          {activeDeal ? (
            <div className="w-[256px] rotate-1 scale-[1.02]">
              <DealCard deal={activeDeal} dragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AnimatePresence>
        {creating && (
          <NewDealDialog
            stages={stages}
            companies={companies}
            onClose={() => setCreating(false)}
            onCreated={(deal) => {
              setDeals((current) => [deal, ...current]);
              setCreating(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ dialog */

function NewDealDialog({
  stages,
  companies,
  onClose,
  onCreated,
}: {
  stages: BoardStage[];
  companies: { id: string; name: string }[];
  onClose: () => void;
  onCreated: (deal: BoardDeal) => void;
}) {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title") ?? ""),
      companyId: String(form.get("companyId") ?? ""),
      stageId: String(form.get("stageId") ?? ""),
      amount: String(form.get("amount") ?? "0"),
      expectedCloseDate: String(form.get("expectedCloseDate") ?? ""),
    };

    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "ثبت معامله ناموفق بود");
        setPending(false);
        return;
      }

      const stage = stages.find((s) => s.id === payload.stageId);
      onCreated({
        id: data.id,
        title: data.title,
        amount: String(data.amount),
        probability: data.probability,
        status: data.status,
        expectedCloseDate: data.expectedCloseDate,
        companyName: companies.find((c) => c.id === payload.companyId)?.name ?? null,
        ownerName: null,
        ownerHue: 180,
        stageId: data.stageId ?? stage?.id ?? null,
      });
    } catch {
      setError("ارتباط با سرور برقرار نشد");
      setPending(false);
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/35 backdrop-blur-[2px]"
      />
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.24, ease: EASE }}
        role="dialog"
        aria-modal="true"
        aria-label="معامله جدید"
        className="fixed inset-x-3 top-[8vh] z-50 mx-auto max-h-[84vh] w-auto max-w-[440px] overflow-y-auto rounded-[14px] border border-line bg-surface p-5 shadow-[var(--shadow-sheet)] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-ink">معامله جدید</h2>
            <p className="mt-0.5 text-[12px] text-ink-faint">اطلاعات پایه را وارد کنید.</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[7px] text-ink-faint hover:bg-surface-2"
            aria-label="بستن"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <Field label="عنوان معامله">
            <Input name="title" required autoFocus placeholder="مثلاً استقرار پلتفرم فروش" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="شرکت">
              <Select name="companyId" defaultValue="">
                <option value="">—</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="مرحله">
              <Select name="stageId" defaultValue={stages[0]?.id ?? ""}>
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="مبلغ (ریال)" hint="فقط عدد">
              <Input name="amount" inputMode="numeric" dir="ltr" className="text-left" placeholder="0" />
            </Field>
            <Field label="تاریخ بستن">
              <Input name="expectedCloseDate" type="date" dir="ltr" className="text-left" />
            </Field>
          </div>

          {error ? (
            <p className="rounded-[7px] bg-clay-soft px-3 py-2 text-[12.5px] text-clay" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              انصراف
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "در حال ثبت…" : "ثبت معامله"}
            </Button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
