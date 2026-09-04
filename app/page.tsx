import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// The landing page is just a gate: signed in -> dashboard, otherwise -> sign in.
export default async function Home() {
  const { userId } = await auth();

  redirect(userId ? "/dashboard" : "/sign-in");
}
