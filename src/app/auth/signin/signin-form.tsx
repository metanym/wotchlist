"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendMagicLink } from "./actions";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    const value = String(formData.get("email") ?? "");
    startTransition(async () => {
      const result = await sendMagicLink(value);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <form action={onSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11"
        />
      </div>
      <Button type="submit" className="h-11" disabled={isPending}>
        {isPending ? "Sending link…" : "Send magic link"}
      </Button>
    </form>
  );
}
