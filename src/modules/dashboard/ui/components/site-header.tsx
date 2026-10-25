"use client";

import React from "react";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean).slice(1);
  const formatSegment = (segment: string) => {
    const decoded = decodeURIComponent(segment);
    return decoded.charAt(0).toUpperCase() + decoded.slice(1);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center bg-[#FAFAFA] shadow-[0_1px_0_0_rgba(0,0,0,0.1)] dark:bg-[#0A0A0A]">
      <div className="flex w-full items-center gap-4 px-4 md:px-6">
        <SidebarTrigger className="size-9 rounded-md text-[#4D4D4D] transition-none hover:bg-[#EBEBEB] hover:text-[#171717] dark:text-[#B3B3B3] dark:hover:bg-[#262626] dark:hover:text-[#FAFAFA]" />
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap gap-2 text-[13px]">
            <BreadcrumbItem>
              {segments.length === 0 ? (
                <BreadcrumbPage className="font-medium text-[#171717] dark:text-[#FAFAFA]">
                  Overview
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href="/dashboard"
                  className="text-[#8F8F8F] hover:text-[#171717] dark:hover:text-[#FAFAFA]"
                >
                  Overview
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {segments.map((segment, index) => {
              const segmentPath = `/dashboard/${segments
                .slice(0, index + 1)
                .join("/")}`;
              const label = formatSegment(segment);

              return (
                <React.Fragment key={segmentPath}>
                  <BreadcrumbSeparator className="text-[#8F8F8F]" />
                  <BreadcrumbItem className="min-w-0">
                    {index === segments.length - 1 ? (
                      <BreadcrumbPage className="max-w-[180px] truncate font-medium text-[#171717] dark:text-[#FAFAFA]">
                        {label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={segmentPath}
                        className="max-w-[140px] truncate text-[#8F8F8F] hover:text-[#171717] dark:hover:text-[#FAFAFA]"
                      >
                        {label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href="/"
            className="hidden h-9 items-center rounded-md px-3 text-sm text-[#4D4D4D] transition-none hover:bg-[#EBEBEB] hover:text-[#171717] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#FAFAFA,0_0_0_4px_#0072F5] dark:text-[#B3B3B3] dark:hover:bg-[#262626] dark:hover:text-[#FAFAFA] sm:inline-flex"
          >
            View site
          </Link>
          <ThemeToggle className="size-9 rounded-md text-[#4D4D4D] transition-none hover:bg-[#EBEBEB] dark:text-[#B3B3B3] dark:hover:bg-[#262626]" />
        </div>
      </div>
    </header>
  );
}
