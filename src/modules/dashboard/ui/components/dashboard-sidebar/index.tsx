import { NavMain } from "@/modules/dashboard/ui/components/dashboard-sidebar/nav-main";
import { NavSecondary } from "@/modules/dashboard/ui/components/dashboard-sidebar/nav-secondary";
import { NavUser } from "@/modules/dashboard/ui/components/dashboard-sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { IconLivePhoto } from "@tabler/icons-react";
import { User } from "@/modules/auth/lib/auth-types";
import { getSession } from "@/modules/auth/lib/get-session";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: "dashboard",
    },
    {
      title: "Cities",
      url: "/dashboard/cities",
      icon: "city",
    },
    {
      title: "Photos",
      url: "/dashboard/photos",
      icon: "photo",
    },
    {
      title: "Posts",
      url: "/dashboard/posts",
      icon: "post",
    },
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: "user",
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
    },
    {
      title: "Get Help",
      url: "#",
    },
    {
      title: "Search",
      url: "#",
    },
  ],
};

export const DashboardSidebar = async ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const session = await getSession();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <IconLivePhoto />
                <span className="text-base font-semibold">Photography</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session?.user as User} />
      </SidebarFooter>
    </Sidebar>
  );
};
