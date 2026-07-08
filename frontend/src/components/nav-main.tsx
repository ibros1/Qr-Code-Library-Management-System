import { NavLink, useLocation } from "react-router";
import type { LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export interface NavMainItem {
  title: string;
  url: string;
  icon: LucideIcon;
  end?: boolean;
}

interface NavMainProps {
  items: NavMainItem[];
  label?: string;
  icon?: LucideIcon;
}

export function NavMain({ items, label = "Menu", icon: LabelIcon }: NavMainProps) {
  const { pathname } = useLocation();

  if (items.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-1.5">
        {LabelIcon && <LabelIcon className="size-3.5" />}
        {label}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = item.end ? pathname === item.url : pathname.startsWith(item.url);
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                <NavLink to={item.url} end={item.end}>
                  <item.icon />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
