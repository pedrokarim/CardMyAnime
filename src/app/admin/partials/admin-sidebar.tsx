"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Database,
  Eye,
  Trash2,
  Settings,
  LogOut,
  User,
  ChevronsUpDown,
} from "lucide-react";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";

export function AdminSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const navItems = [
    {
      title: "Accueil",
      url: "/admin",
      icon: Home,
    },
    {
      title: "Statistiques",
      url: "/admin/stats",
      icon: Database,
    },
    {
      title: "Logs",
      url: "/admin/logs",
      icon: Eye,
    },
    {
      title: "Suppressions",
      url: "/admin/data-deletion",
      icon: Trash2,
    },
    {
      title: "Profil",
      url: "/admin/profile",
      icon: User,
    },
    {
      title: "Paramètres",
      url: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-3 py-2">
          <img
            src={SITE_CONFIG.site.logo}
            alt={`${SITE_CONFIG.site.name} Logo`}
            className="w-8 h-8 rounded-lg"
          />
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="text-sm font-semibold">{SITE_CONFIG.site.name}</div>
            <div className="text-xs text-muted-foreground">Administration</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
              Navigation
            </SidebarGroupLabel>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <Icon className="size-4" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start group-data-[collapsible=icon]:justify-center p-2 h-auto"
              >
                <div className="flex items-center gap-2 group-data-[collapsible=icon]:gap-0 min-w-0">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="Avatar"
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div className="group-data-[collapsible=icon]:hidden text-left min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {session?.user?.name || "Admin"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {session?.user?.email || "admin@cardmyanime.com"}
                    </div>
                  </div>
                  <ChevronsUpDown className="w-4 h-4 ml-auto group-data-[collapsible=icon]:hidden flex-shrink-0" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56"
              align="end"
              side="top"
              sideOffset={8}
            >
              <DropdownMenuLabel>
                <div className="flex items-center gap-2">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="Avatar"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-3 h-3 text-primary" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium">
                      {session?.user?.name || "Admin"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {session?.user?.email || "admin@cardmyanime.com"}
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/profile" className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
