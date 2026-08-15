import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Settings,
  ShoppingCart,
  Sun,
  Tags,
  Users,
  Warehouse,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth";
import { setAppCurrency } from "@/lib/format";
import { settingsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import type { TranslationKey } from "@/lib/i18n/translations";

const NAV: {
  to: string;
  labelKey: TranslationKey;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
}[] = [
  { to: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/products", labelKey: "nav.products", icon: Package },
  { to: "/categories", labelKey: "nav.categories", icon: Tags },
  { to: "/customers", labelKey: "nav.customers", icon: Users },
  { to: "/sales", labelKey: "nav.sales", icon: ShoppingCart },
  { to: "/inventory", labelKey: "nav.inventory", icon: Warehouse },
  { to: "/reports", labelKey: "nav.reports", icon: BarChart3 },
  { to: "/settings", labelKey: "nav.settings", icon: Settings, adminOnly: true },
];

function NavLinks({
  onNavigate,
  isAdmin,
}: {
  onNavigate?: () => void;
  isAdmin: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useLanguage();

  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-0.5 px-3 pb-4">
      <p className="px-3 pb-2 pt-1 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
        {t("nav.workspace")}
      </p>
      {NAV.filter((item) => !item.adminOnly || isAdmin).map(({ to, labelKey, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-opacity",
                  active ? "opacity-100" : "opacity-0",
                )}
              />
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{t(labelKey)}</span>
            </Link>
          );
        })}
    </nav>
  );
}

function Brand() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2.5 border-b border-border px-5 py-[1.15rem]">
      <img
        src="/logo-icon.png"
        alt="SmartBiz"
        width={36}
        height={36}
        className="size-9 shrink-0 rounded-xl object-cover shadow-sm"
      />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold text-foreground">SmartBiz ERP</p>
        <p className="truncate text-xs text-muted-foreground">{t("brand.liteEdition")}</p>
      </div>
    </div>
  );
}


export function AppLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { theme, toggle } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const settings = useQuery(settingsQuery);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (settings.data?.currency) {
      setAppCurrency(settings.data.currency);
    }
  }, [settings.data?.currency]);

  const displayName = authLoading
    ? t("nav.loading")
    : user?.name?.trim() || t("nav.profileUnavailable");
  const displayEmail = authLoading
    ? t("nav.checkingSession")
    : user?.email?.trim() || t("nav.unableLoadProfile");

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-sidebar lg:flex">
        <Brand />
        <NavLinks isAdmin={isAdmin} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Brand />
          <NavLinks isAdmin={isAdmin} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={t("nav.openNav")}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          <div className="ml-auto flex items-center gap-1.5">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              onClick={toggle}
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  aria-label={t("nav.openAccount")}
                  className="h-11 gap-2.5 rounded-full px-1.5 sm:rounded-lg sm:px-2"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden min-w-0 flex-col items-start leading-tight sm:flex">
                    <span className="max-w-[10rem] truncate text-sm font-medium capitalize">
                      {displayName}
                    </span>
                    <span className="max-w-[10rem] truncate text-xs text-muted-foreground">
                      {displayEmail}
                    </span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="space-y-1.5 py-2.5">
                  <p className="truncate text-sm font-semibold capitalize">{displayName}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">
                    {displayEmail}
                  </p>
                  {user?.role ? (
                    <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[0.7rem] font-semibold capitalize text-primary">
                      {user.role}
                    </span>
                  ) : null}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin ? (
                  <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                    <Settings className="size-4" />
                    {t("nav.settings")}
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  onClick={async () => {
                    setIsSigningOut(true);
                    try {
                      const { error } = await signOut();
                      if (error) {
                        console.error("Sign out error:", error);
                      }
                      navigate({ to: "/login" });
                    } catch (error) {
                      console.error("Failed to sign out:", error);
                    } finally {
                      setIsSigningOut(false);
                    }
                  }}
                  disabled={isSigningOut}
                >
                  <LogOut className="size-4" />
                  {isSigningOut ? t("nav.signingOut") : t("nav.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">{children}</main>

      </div>
    </div>
  );
}
