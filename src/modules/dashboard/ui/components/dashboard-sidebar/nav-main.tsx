"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { IconPhotoUp } from "@tabler/icons-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import IconMap from "./icon-map";
import { useModal } from "@/hooks/use-modal";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: string;
  }[];
}) {
  const modal = useModal();
  const pathname = usePathname();
  const exactMatchItem = items.find((item) => item.url === pathname);
  const bestMatchItem = items.reduce((best, item) => {
    if (
      pathname.startsWith(item.url) &&
      (!best || item.url.length > best.url.length)
    ) {
      return item;
    }
    return best;
  }, null as (typeof items)[0] | null);

  return (
    <SidebarGroup className="px-2 py-3">
      <SidebarGroupContent className="flex flex-col gap-6">
        <div>
          <SidebarGroupLabel className="h-7 px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#8F8F8F]">
            Create
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={modal.onOpen}
                tooltip="Add photo"
                className="h-9 rounded-md bg-white px-3 text-[14px] font-medium text-[#0072F5] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] transition-none hover:bg-[#EBEBEB] hover:text-[#005FCC] dark:bg-[#171717] dark:text-[#52AEFF] dark:hover:bg-[#262626]"
              >
                <IconPhotoUp />
                <span>Add photo</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
        <div>
          <SidebarGroupLabel className="h-7 px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#8F8F8F]">
            Workspace
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={
                    exactMatchItem
                      ? exactMatchItem.url === item.url
                      : bestMatchItem?.url === item.url
                  }
                  className="h-9 rounded-md px-3 text-[14px] font-normal text-[#4D4D4D] transition-none hover:bg-[#EBEBEB] hover:text-[#171717] data-[active=true]:bg-white data-[active=true]:font-medium data-[active=true]:text-[#171717] data-[active=true]:shadow-[0_0_0_1px_rgba(0,0,0,0.08)] data-[active=true]:[&>svg]:text-[#0072F5] dark:text-[#B3B3B3] dark:hover:bg-[#262626] dark:hover:text-[#FAFAFA] dark:data-[active=true]:bg-[#171717] dark:data-[active=true]:text-[#FAFAFA] dark:data-[active=true]:shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                  asChild
                >
                  <Link href={item.url as Route}>
                    <IconMap icon={item.icon} />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
