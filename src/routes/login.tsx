import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/layout/auth-layout";
import { signIn } from "@/lib/auth";
import { redirectIfAuthenticated } from "@/lib/route-guards";

export const Route = createFileRoute("/login")({
  beforeLoad: redirectIfAuthenticated,
  head: () => ({
    meta: [
      { title: "Sign in — SmartBiz ERP Lite" },
      { name: "description", content: "Sign in to your SmartBiz ERP Lite workspace." },
      { property: "og:title", content: "Sign in — SmartBiz ERP Lite" },
      { property: "og:description", content: "Access your inventory and sales workspace." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsLoading(true);
    try {
      const { user, error } = await signIn(values.email, values.password);

      if (error) {
        toast.error("Sign in failed", {
          description: error.message || "Please check your credentials and try again.",
        });
        return;
      }

      if (!user) {
        toast.error("Profile unavailable", {
          description:
            "You are authenticated, but your profile could not be loaded. Please try again.",
        });
        return;
      }

      toast.success("Welcome back", {
        description: `Signed in as ${user.email}`,
      });
      navigate({ to: "/" });
    } catch {
      toast.error("Sign in failed", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Enter your credentials to access your workspace."
      footer={
        <>
          No account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
          <p className="text-xs text-destructive">{form.formState.errors.email?.message}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" {...form.register("password")} />
          <p className="text-xs text-destructive">{form.formState.errors.password?.message}</p>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
