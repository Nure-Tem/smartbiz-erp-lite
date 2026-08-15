import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";
import { paymentMethodKey } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

const PAYMENT_TONES: Record<string, string> = {
  cash: "border-success/40 bg-success/15 text-success-strong",
  bank: "border-primary/40 bg-primary/12 text-primary",
  credit: "border-warning/50 bg-warning/20 text-warning-strong",
  telebirr: "border-telebirr bg-telebirr text-telebirr-foreground",
  ebirr: "border-primary/50 bg-primary/15 text-primary",
};

export function PaymentBadge({ method }: { method: string }) {
  const { t } = useLanguage();
  const key = (method ?? "").toLowerCase();
  const labelKey = paymentMethodKey(key);
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold tracking-tight",
        PAYMENT_TONES[key] ?? "border-border bg-muted text-foreground",
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current opacity-80" />
      {t(labelKey)}
    </Badge>
  );
}

export type StockLevel = "out" | "low" | "ok";

export function stockLevel(stock: number, minStock: number): StockLevel {
  if (stock <= 0) return "out";
  if (stock <= minStock) return "low";
  return "ok";
}

const STOCK_TONES: Record<StockLevel, string> = {
  out: "border-destructive/45 bg-destructive/12 text-destructive",
  low: "border-warning/55 bg-warning/20 text-warning-strong",
  ok: "border-success/40 bg-success/15 text-success-strong",
};

export function StockBadge({
  level,
  label,
  className,
}: {
  level: StockLevel;
  label?: string | undefined;
  className?: string | undefined;
}) {
  const { t } = useLanguage();
  const defaultLabel =
    level === "out" ? t("stock.out") : level === "low" ? t("stock.low") : t("stock.inStock");

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold",
        STOCK_TONES[level],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {label ?? defaultLabel}
    </Badge>
  );
}
