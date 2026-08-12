import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: LucideIcon | undefined;
  title: string;
  description?: string | undefined;
  actionLabel?: string | undefined;
  onAction?: (() => void) | undefined;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full border border-border bg-card shadow-sm">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div className="max-w-sm">
        <p className="text-base font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actionLabel && onAction ? (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
