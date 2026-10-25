import { NavMain } from "@/modules/dashboard/ui/components/dashboard-sidebar/nav-main";
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
  ],
};

export const DashboardSidebar = async ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const session = await getSession();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="px-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-11 rounded-md px-2 hover:bg-transparent"
            >
              <Link href="/dashboard" className="gap-3">
                <IconLivePhoto className="size-5 text-[#171717] dark:text-[#FAFAFA]" />
                <span className="text-[14px] font-medium tracking-[-0.28px] text-[#171717] dark:text-[#FAFAFA]">
                  Photography
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0 px-2">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="p-3">
        <NavUser user={session?.user as User} />
      </SidebarFooter>
    </Sidebar>
  );
};
