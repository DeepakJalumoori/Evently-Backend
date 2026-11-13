import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/auth-context";
import { registerSchema, RegisterFormData } from "@/features/auth/schemas/authValidationSchemas";
import { getApiErrorMessage } from "@/services/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, User as UserIcon, AlertCircle, Ticket, Calendar } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utils/cn";

export function RegisterPage() {
  const { register: registerUser, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "attendee",
    },
  });

  const selectedRole = watch("role");

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const dest = user.role === "organizer" ? "/organizer" : "/events";
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      const response = await registerUser(data);
      toast.success(`Account created! Welcome to Evently, ${response.user.name}.`);
      const target = response.user.role === "organizer" ? "/organizer" : "/events";
      navigate(target, { replace: true });
    } catch (err) {
      const message = getApiErrorMessage(err);
      setApiError(message);
    }
  };

  return (
    <Card className="border-surface-border shadow-float w-full max-w-full overflow-hidden">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-charcoal-900">
          Create an account
        </CardTitle>
        <CardDescription className="text-sm text-charcoal-500">
          Join Evently to discover community gatherings or host your own
        </CardDescription>
      </CardHeader>

      <CardContent>
        {apiError && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200/60 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Account Role Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700 select-none">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setValue("role", "attendee")}
                className={cn(
                  "p-2.5 sm:p-3.5 rounded-xl border text-left transition-all duration-150 flex flex-col gap-1 focus:outline-none select-none min-w-0",
                  selectedRole === "attendee"
                    ? "border-coral-500 bg-coral-50/60 ring-2 ring-coral-500/20"
                    : "border-surface-border bg-white hover:bg-surface-subtle text-charcoal-600"
                )}
              >
                <div className="flex items-center justify-between w-full gap-1">
                  <span className="font-semibold text-xs text-charcoal-900 truncate">Attendee</span>
                  <Ticket className={cn("h-4 w-4 shrink-0", selectedRole === "attendee" ? "text-coral-500" : "text-charcoal-400")} />
                </div>
                <p className="text-[11px] text-charcoal-500 leading-tight">
                  Book seats & explore
                </p>
              </button>

              <button
                type="button"
                onClick={() => setValue("role", "organizer")}
                className={cn(
                  "p-2.5 sm:p-3.5 rounded-xl border text-left transition-all duration-150 flex flex-col gap-1 focus:outline-none select-none min-w-0",
                  selectedRole === "organizer"
                    ? "border-coral-500 bg-coral-50/60 ring-2 ring-coral-500/20"
                    : "border-surface-border bg-white hover:bg-surface-subtle text-charcoal-600"
                )}
              >
                <div className="flex items-center justify-between w-full gap-1">
                  <span className="font-semibold text-xs text-charcoal-900 truncate">Organizer</span>
                  <Calendar className={cn("h-4 w-4 shrink-0", selectedRole === "organizer" ? "text-coral-500" : "text-charcoal-400")} />
                </div>
                <p className="text-[11px] text-charcoal-500 leading-tight">
                  Publish & manage
                </p>
              </button>
            </div>
            {errors.role && (
              <p className="text-xs text-red-600 font-medium">{errors.role.message}</p>
            )}
          </div>

          <Input
            label="Full Name"
            placeholder="Deepak Jalmoori"
            autoComplete="name"
            leftIcon={<UserIcon className="h-4 w-4" />}
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            autoComplete="new-password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            size="md"
            isLoading={isSubmitting}
          >
            Create {selectedRole === "organizer" ? "Organizer" : "Attendee"} Account
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 text-center text-xs text-charcoal-500">
        <p>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-coral-600 hover:text-coral-700 hover:underline"
          >
            Sign in instead
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
