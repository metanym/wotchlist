"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function sendMagicLink(email: string): Promise<{ error?: string }> {
  try {
    await signIn("resend", { email, redirectTo: "/dashboard" });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Couldn't send the sign-in link. Check the email address and try again." };
    }
    throw error;
  }
}

export async function signInWithFacebook() {
  await signIn("facebook", { redirectTo: "/dashboard" });
}
