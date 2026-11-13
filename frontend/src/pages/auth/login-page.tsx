import * as React from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/auth-context";
import { loginSchema, LoginFormData } from "@/features/auth/schemas/authValidationSchemas";
import { getApiErrorMessage } from "@/services/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isSessionExpired = searchParams.get("expired") === "true";
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // If already authenticated, redirect to destination or role dashboard
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const target = user.role === "organizer" ? "/organizer" : "/events";
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      const response = await login(data);
      toast.success(`Welcome back, ${response.user.name}!`);

      // Determine redirect location
      const stateFrom = (location.state as { from?: { pathname: string } })?.from?.pathname;
      const redirectParam = searchParams.get("redirect");
      const defaultDest = response.user.role === "organizer" ? "/organizer" : "/events";

      navigate(stateFrom || redirectParam || defaultDest, { replace: true });
    } catch (err) {
      const message = getApiErrorMessage(err);
      setApiError(message);
    }
  };

  return (
    <Card className="border-surface-border shadow-float w-full max-w-full overflow-hidden">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-charcoal-900">
          Sign in to Evently
        </CardTitle>
        <CardDescription className="text-sm text-charcoal-500">
          Enter your account credentials to access your tickets and events
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isSessionExpired && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>Your session has expired. Please sign in again to continue.</span>
          </div>
        )}

        {apiError && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200/60 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
            placeholder="••••••••"
            autoComplete="current-password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            size="lg"
            isLoading={isSubmitting}
          >
            Sign In
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 text-center text-xs text-charcoal-500">
        <p>
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-coral-600 hover:text-coral-700 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
