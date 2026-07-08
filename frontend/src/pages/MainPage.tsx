import { Outlet } from "react-router";

import { AppSidebar } from "../components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../context/AuthContext";

const MainPage = () => {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <p className="text-sm text-muted-foreground">
            Welcome back{user ? `, ${user.full_name.split(" ")[0]}` : ""}
          </p>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainPage;
