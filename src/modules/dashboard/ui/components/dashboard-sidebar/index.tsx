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
import { RiCameraLensFill } from "react-icons/ri";
import { siteConfig } from "@/site.config";
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
              className="h-12 rounded-md px-2 hover:bg-transparent"
            >
              <Link
                href="/dashboard"
                aria-label={`${siteConfig.name} dashboard`}
                className="gap-3"
              >
                <RiCameraLensFill
                  aria-hidden="true"
                  className="size-5 shrink-0 text-[#171717] dark:text-[#FAFAFA]"
                />
                <span className="flex min-w-0 flex-col gap-1 leading-none">
                  <span className="truncate text-[13px] font-semibold uppercase tracking-[0.08em] text-[#171717] dark:text-[#FAFAFA]">
                    {siteConfig.name}
                  </span>
                  <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#8F8F8F]">
                    Dashboard
                  </span>
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
