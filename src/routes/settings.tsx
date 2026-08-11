import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/common/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/use-theme";
import { requireAuth } from "@/lib/route-guards";
import { listProfiles, profileDisplayName, profileInitials } from "@/lib/api/profiles";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { settingsQuery } from "@/lib/queries";
import { saveSettings, type SaveSettingsInput } from "@/lib/api/settings";

export const Route = createFileRoute("/settings")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Settings — SmartBiz ERP Lite" },
      { name: "description", content: "Company details, users and workspace preferences." },
      { property: "og:title", content: "Settings — SmartBiz ERP Lite" },
      { property: "og:description", content: "Configure your SmartBiz workspace." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, toggle } = useTheme();
  const qc = useQueryClient();

  const profilesQuery = useQuery({
    queryKey: ["profiles"],
    queryFn: listProfiles,
  });

  const business = useQuery(settingsQuery);

  const [form, setForm] = useState<SaveSettingsInput>({
    businessName: "",
    businessLogoUrl: "",
    currency: "ETB",
    taxPercentage: 0,
    receiptFooter: "",
  });

  useEffect(() => {
    if (business.data) {
      const { id: _id, ...rest } = business.data;
      setForm(rest);
    }
  }, [business.data]);

  const save = useMutation({
    mutationFn: () => saveSettings(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Company details saved");
    },
    onError: (error: Error) => toast.error(error.message || "Could not save settings"),
  });


  return (
    <AppLayout>
      <PageHeader title="Settings" description="Manage your business profile, team and preferences." />

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Company information</CardTitle>
              <CardDescription>Shown on invoices and receipts.</CardDescription>
            </CardHeader>
            <CardContent>
              {business.isLoading ? (
                <LoadingSpinner label="Loading company settings..." />
              ) : business.isError ? (
                <p className="text-sm text-destructive">
                  Failed to load company settings. Please try refreshing.
                </p>
              ) : (
                <form
                  className="grid gap-4 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    save.mutate();
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business name</Label>
                    <Input
                      id="business-name"
                      value={form.businessName}
                      onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={form.currency}
                      onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax-percentage">Tax percentage</Label>
                    <Input
                      id="tax-percentage"
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.taxPercentage}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, taxPercentage: Number(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo-url">Business logo URL</Label>
                    <Input
                      id="logo-url"
                      value={form.businessLogoUrl}
                      onChange={(e) => setForm((f) => ({ ...f, businessLogoUrl: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="receipt-footer">Receipt footer</Label>
                    <Input
                      id="receipt-footer"
                      value={form.receiptFooter}
                      onChange={(e) => setForm((f) => ({ ...f, receiptFooter: e.target.value }))}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" disabled={save.isPending}>
                      {save.isPending ? "Saving..." : "Save changes"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>

          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Team members</CardTitle>
              <CardDescription>All registered users in this workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {profilesQuery.isLoading && <LoadingSpinner label="Loading team members..." />}

              {profilesQuery.isError && (
                <p className="text-sm text-destructive">
                  Failed to load team members. Please try refreshing.
                </p>
              )}

              {!profilesQuery.isLoading && !profilesQuery.isError && (profilesQuery.data ?? []).map((profile) => {
                const displayName = profileDisplayName(profile);
                const initials = profileInitials(profile);
                const role = profile.role ?? "—";
                const isAdmin = role.toLowerCase() === "admin";

                return (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{displayName}</p>
                        <p className="text-xs text-muted-foreground">{profile.email}</p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={isAdmin ? "bg-primary/15 text-primary" : ""}
                    >
                      {role}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Workspace defaults for this device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Dark mode</p>
                  <p className="text-xs text-muted-foreground">Switch the interface theme.</p>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={toggle} />
              </div>
              {[
                ["Low stock alerts", "Notify me when stock drops below the minimum."],
                ["Email receipts", "Send a receipt to the customer after each sale."],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
