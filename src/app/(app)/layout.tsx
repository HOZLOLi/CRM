import { redirect } from "next/navigation";
import { getSession } from "@/server/auth";
import { dbReady } from "@/server/db";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await dbReady();
  const user = await getSession();
  if (!user) redirect("/login");
  return <AppShell user={user}>{children}</AppShell>;
}
