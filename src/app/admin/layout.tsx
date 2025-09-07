import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { AdminBreadcrumbs } from "./partials/admin-breadcrumbs";
import { AdminSidebar } from "./partials/admin-sidebar";
import { AdminAuthWrapper } from "./partials/admin-auth-wrapper";
import { Separator } from "@/components/ui/separator";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthWrapper>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />

          <SidebarInset className="flex flex-1 flex-col">
            {/* barre supérieure du contenu: bouton toggle + séparateur + breadcrumb */}
            <div className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
              <SidebarTrigger>
                <Menu className="size-5" />
              </SidebarTrigger>
              <div className="h-6 w-0.5 bg-border mx-2" />
              <AdminBreadcrumbs />
              <div className="ms-auto" />
            </div>

            {/* contenu sans carte */}
            <div className="flex-1 p-4">{children}</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AdminAuthWrapper>
  );
}
