"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-md border-2 border-ink px-4 py-2 text-sm font-bold text-ink transition hover:bg-ink hover:text-white"
    >
      Sair
    </button>
  );
}
