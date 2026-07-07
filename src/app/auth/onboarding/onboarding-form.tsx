"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setDisplayName } from "./actions";

export function OnboardingForm() {
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await setDisplayName(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <form action={onSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          name="displayName"
          autoComplete="name"
          placeholder="Jon"
          required
          className="h-11"
        />
      </div>
      <Button type="submit" className="h-11" disabled={isPending}>
        {isPending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
