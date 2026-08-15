import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/layout/auth-layout";
import { supabase } from "@/lib/supabase";
import { redirectIfAuthenticated } from "@/lib/route-guards";

export const Route = createFileRoute("/forgot-password")({
  beforeLoad: redirectIfAuthenticated,
  head: () => ({
    meta: [
      { title: "Reset password — SmartBiz ERP Lite" },
      { name: "description", content: "Request a password reset link for SmartBiz ERP Lite." },
      { property: "og:title", content: "Reset password — SmartBiz ERP Lite" },
      { property: "og:description", content: "Recover access to your SmartBiz workspace." },
    ],
  }),
  component: ForgotPasswordPage,
});

const schema = z.object({ email: z.string().email("Enter a valid email") });

function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error("Failed to send reset link", { 
          description: error.message || "Please try again later." 
        });
        return;
      }

      toast.success("Reset link sent", { 
        description: `Check your email at ${values.email} for the reset link.` 
      });
      form.reset();
    } catch (error) {
      toast.error("Failed to send reset link", { 
        description: "An unexpected error occurred. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="We'll send a reset link to your email address."
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          <p className="text-xs text-destructive">{form.formState.errors.email?.message}</p>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </AuthLayout>
  );
}
