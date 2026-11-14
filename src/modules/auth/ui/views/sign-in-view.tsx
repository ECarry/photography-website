"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { OctagonAlert } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "../../lib/auth-client";

type SignInViewProps = {
  canRegister: boolean;
};

export const SignInView = ({ canRegister }: SignInViewProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [isRegistering, setIsRegistering] = useState(canRegister);

  const authSchema = z.object({
    email: z.email(),
    password: z.string().min(isRegistering ? 8 : 1, {
      message: isRegistering
        ? "Password must be at least 8 characters"
        : "Password is required",
    }),
    name: isRegistering
      ? z.string().trim().min(1, { message: "Name is required" })
      : z.string(),
  });

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = (values: z.infer<typeof authSchema>) => {
    setError(null);
    setPending(true);

    const callbacks = {
      onSuccess: () => {
        setPending(false);
        toast.success(
          isRegistering
            ? "Account created successfully"
            : "Signed in successfully",
        );
        router.replace("/dashboard");
      },
      onError: ({ error }: { error: { message: string } }) => {
        setPending(false);
        setError(error.message);
      },
    };

    if (isRegistering) {
      authClient.signUp.email(
        {
          name: values.name,
          email: values.email,
          password: values.password,
          callbackURL: "/dashboard",
        },
        callbacks,
      );
      return;
    }

    authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: "/dashboard",
      },
      callbacks,
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-3">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-6 md:p-8 flex flex-col justify-center min-h-full"
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">
                    {isRegistering ? "Create your account" : "Welcome back"}
                  </h1>
                  <p className="text-muted-foreground text-balance">
                    {isRegistering
                      ? "Set up the first account for this site"
                      : "Sign in to your account"}
                  </p>
                </div>

                {isRegistering && (
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your.email@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="* * * * * * * *"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {!!error && (
                  <Alert className="bg-destructive/10 border-none">
                    <OctagonAlert className="h-4 w-4 text-destructive!" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending && <Spinner />}
                  {isRegistering ? "Create Account" : "Sign In"}
                </Button>

                {canRegister && (
                  <p className="text-center text-sm text-muted-foreground">
                    {isRegistering
                      ? "Already have an account?"
                      : "Setting up this site for the first time?"}{" "}
                    <button
                      type="button"
                      className="font-medium text-foreground underline underline-offset-4"
                      onClick={() => {
                        setError(null);
                        setIsRegistering((current) => !current);
                      }}
                    >
                      {isRegistering ? "Sign in" : "Create the first account"}
                    </button>
                  </p>
                )}
              </div>
            </form>
          </Form>
          <div className="col-span-2 bg-radial from-sidebar-accent to-sidebar relative hidden md:flex flex-col gap-y-4 items-center justify-center">
            <Image
              src="/bg.jpg"
              alt="Better nextjs"
              width={1920}
              height={1080}
              className="size-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
