"use client";

import { usePathname } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const semMenu = pathname === "/admin/login";

  return (
    <div className="min-h-screen bg-bg">
      <AdminNav />
      <div className={semMenu ? "" : "sm:pl-56"}>{children}</div>
    </div>
  );
}
