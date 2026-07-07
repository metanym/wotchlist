"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createList } from "../actions";

export function NewListForm() {
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createList(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="Rainy Day Films" required className="h-11" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" name="description" placeholder="What's this list for?" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="type">Type</Label>
        <Select name="type" defaultValue="PERSONAL">
          <SelectTrigger id="type" className="h-11 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PERSONAL">Personal</SelectItem>
            <SelectItem value="SHARED">Shared</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="h-11" disabled={isPending}>
        {isPending ? "Creating…" : "Create list"}
      </Button>
    </form>
  );
}
