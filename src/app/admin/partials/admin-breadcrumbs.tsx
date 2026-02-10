"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

// Mapping pour des labels lisibles
const LABELS: Record<string, string> = {
  admin: "Admin",
  stats: "Statistiques",
  logs: "Logs",
  "data-deletion": "Suppressions",
  trends: "Tendances",
  cron: "Jobs Cron",
  settings: "Paramètres",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = (pathname ?? "").split("/").filter(Boolean);

  // Construit les items progressifs
  const items = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = LABELS[seg] ?? seg;
    const isLast = idx === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((it, i) => (
          <React.Fragment key={it.href}>
            <BreadcrumbItem>
              {it.isLast ? (
                <BreadcrumbPage>{it.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={it.href}>{it.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {i < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
