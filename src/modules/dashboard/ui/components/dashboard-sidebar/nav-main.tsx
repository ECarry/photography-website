"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { IconPhotoUp } from "@tabler/icons-react";
import {
  SidebarGroup,
  SidebarGroupContent,
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
    <>
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                onClick={() => modal.onOpen()}
                tooltip="Add Photo"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              >
                <IconPhotoUp />
                <span>Add Photo</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={
                    exactMatchItem
                      ? exactMatchItem.url === item.url
                      : bestMatchItem?.url === item.url
                  }
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
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
