"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function AdminNav() {
  return (
    <div className="flex items-center gap-2">
      <SidebarTrigger className="hidden md:inline-flex">
        <Menu className="size-5" />
      </SidebarTrigger>
    </div>
  );
}
