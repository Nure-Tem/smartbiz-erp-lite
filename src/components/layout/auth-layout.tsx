import type { ReactNode } from "react";
import { Boxes } from "lucide-react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground/15">
            <Boxes className="size-5" />
          </div>
          <span className="text-sm font-semibold">SmartBiz ERP Lite</span>
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-semibold leading-tight">
            Inventory, sales and customers in one calm workspace.
          </h2>
          <p className="text-sm text-primary-foreground/80">
            Track stock levels, monitor revenue and keep your team aligned — built for small and
            medium businesses.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              ["12k+", "Orders tracked"],
              ["99.9%", "Uptime"],
              ["4.9/5", "Owner rating"],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="text-xl font-semibold">{v}</p>
                <p className="text-xs text-primary-foreground/70">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-primary-foreground/60">
          © 2026 SmartBiz. Demo environment.
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Boxes className="size-5" />
            </div>
            <span className="text-sm font-semibold text-foreground">SmartBiz ERP Lite</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
          {footer ? <div className="text-center text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
