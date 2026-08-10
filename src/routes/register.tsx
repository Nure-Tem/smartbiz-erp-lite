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
import { signUp } from "@/lib/auth";
import { redirectIfAuthenticated } from "@/lib/route-guards";

export const Route = createFileRoute("/register")({
  beforeLoad: redirectIfAuthenticated,
  head: () => ({
    meta: [
      { title: "Create account — SmartBiz ERP Lite" },
      { name: "description", content: "Create your SmartBiz ERP Lite workspace in seconds." },
      { property: "og:title", content: "Create account — SmartBiz ERP Lite" },
      { property: "og:description", content: "Start managing inventory, sales and customers." },
    ],
  }),
  component: RegisterPage,
});

const schema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    company: z.string().min(2, "Enter your business name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "At least 6 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", company: "", email: "", password: "", confirm: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsLoading(true);
    try {
      const { user, error } = await signUp(values.email, values.password, {
        name: values.name,
        company: values.company,
      });
      
      if (error) {
        toast.error("Registration failed", { 
          description: error.message || "Please try again with different credentials." 
        });
        return;
      }

      // Registration successful (user may be null if email confirmation is disabled)
      toast.success("Account created successfully", { 
        description: "Your account is ready to use. Redirecting to login..." 
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 1500);
      
    } catch (error) {
      toast.error("Registration failed", { 
        description: "An unexpected error occurred. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing inventory, sales and customers today."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {(
          [
            ["name", "Full name", "text"],
            ["company", "Business name", "text"],
            ["email", "Email", "email"],
            ["password", "Password", "password"],
            ["confirm", "Confirm password", "password"],
          ] as const
        ).map(([field, label, type]) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <Input id={field} type={type} {...form.register(field)} />
            <p className="text-xs text-destructive">{form.formState.errors[field]?.message}</p>
          </div>
        ))}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
