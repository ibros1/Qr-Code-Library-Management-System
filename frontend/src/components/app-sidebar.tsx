import type { ComponentProps } from "react";
import { BookOpenIcon, LayoutDashboardIcon, QrCodeIcon, ReceiptIcon, ShieldIcon, TagIcon, UsersIcon } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import type { NavMainItem } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";

const mainNavItems: NavMainItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboardIcon, end: true },
  { title: "Books", url: "/books", icon: BookOpenIcon },
  { title: "Borrow / Return", url: "/borrow", icon: QrCodeIcon },
  { title: "Fines", url: "/fines", icon: ReceiptIcon },
];

const adminNavItems: NavMainItem[] = [
  { title: "Categories", url: "/categories", icon: TagIcon },
  { title: "Members", url: "/members", icon: UsersIcon },
];

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const { isAdmin } = useAuth();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="pointer-events-none">
              <div>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <QrCodeIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">QR Library</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">Management System</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={mainNavItems} label="Menu" />
        {isAdmin && (
          <>
            <SidebarSeparator />
            <NavMain items={adminNavItems} label="Admin" icon={ShieldIcon} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
