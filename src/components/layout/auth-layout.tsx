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
      <div className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between lg:p-10 lg:text-primary-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 45%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.12), transparent 40%)",
          }}
        />

        <div className="relative flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground/15">
            <Boxes className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">SmartBiz ERP Lite</p>
            <p className="text-xs text-primary-foreground/70">Business workspace</p>
          </div>
        </div>

        <div className="relative max-w-md space-y-3">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Sign in to manage inventory, sales and customers.
          </h2>
          <p className="text-sm leading-relaxed text-primary-foreground/80">
            A focused workspace for day-to-day stock control, invoicing and team operations.
          </p>
        </div>

        <p className="relative text-xs text-primary-foreground/60">© 2026 SmartBiz ERP Lite</p>
      </div>

      <div className="flex items-center justify-center bg-background p-6 sm:p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Boxes className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">SmartBiz ERP Lite</p>
              <p className="text-xs text-muted-foreground">Business workspace</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>

          {footer ? <div className="text-center text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
