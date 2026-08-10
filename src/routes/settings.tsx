import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
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

  const profilesQuery = useQuery({
    queryKey: ["profiles"],
    queryFn: listProfiles,
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
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("Company details saved");
                }}
              >
                {[
                  ["company", "Business name", "SmartBiz Trading Ltd"],
                  ["email", "Contact email", "hello@smartbiz.app"],
                  ["phone", "Phone", "+1 202 555 0100"],
                  ["tax", "Tax / VAT number", "US-4429183"],
                ].map(([id, label, value]) => (
                  <div key={id} className="space-y-2">
                    <Label htmlFor={id}>{label}</Label>
                    <Input id={id} defaultValue={value} />
                  </div>
                ))}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" defaultValue="18 Market Street, Boston, MA" />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit">Save changes</Button>
                </div>
              </form>
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
