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
      className="flex-shrink-0 border border-line px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-inkSoft transition hover:border-ink hover:text-ink sm:w-full sm:text-center"
    >
      Sair
    </button>
  );
}
