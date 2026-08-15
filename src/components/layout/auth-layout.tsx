import type { ReactNode } from "react";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { useLanguage } from "@/hooks/use-language";

function AuthBrand({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { t } = useLanguage();
  const isDark = variant === "dark";

  return (
    <div className="flex items-center gap-2.5">
      <img
        src={isDark ? "/logo-icon-dark.png" : "/logo-icon.png"}
        alt="SmartBiz"
        width={36}
        height={36}
        className="size-9 shrink-0 rounded-xl object-cover shadow-sm"
      />
      <div>
        <p
          className={
            isDark
              ? "text-sm font-semibold text-primary-foreground"
              : "text-sm font-semibold text-foreground"
          }
        >
          SmartBiz ERP Lite
        </p>
        <p
          className={
            isDark
              ? "text-xs text-primary-foreground/70"
              : "text-xs text-muted-foreground"
          }
        >
          {t("brand.businessWorkspace")}
        </p>
      </div>
    </div>
  );
}

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
  const { t } = useLanguage();

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

        <div className="relative">
          <AuthBrand variant="dark" />
        </div>

        <div className="relative max-w-md space-y-3">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            {t("auth.heroTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-primary-foreground/80">
            {t("auth.heroSubtitle")}
          </p>
        </div>

        <p className="relative text-xs text-primary-foreground/60">{t("auth.copyright")}</p>
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 sm:p-8 lg:min-h-0">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <LanguageSwitcher />
        </div>
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden">
            <AuthBrand variant="light" />
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-primary/5 sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>

          {footer ? <div className="text-center text-sm text-muted-foreground">{footer}</div> : null}

          <p className="pt-2 text-center text-xs text-muted-foreground lg:hidden">
            {t("auth.copyright")}
          </p>
        </div>
      </div>
    </div>
  );
}
