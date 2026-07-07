"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function setDisplayName(formData: FormData) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) {
    return { error: "Enter a display name." };
  }

  await db().user.update({
    where: { id: session.user.id },
    data: { displayName },
  });

  redirect("/dashboard");
}
