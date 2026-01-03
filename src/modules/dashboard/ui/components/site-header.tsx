"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
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

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            {pathname
              .split("/")
              .filter(Boolean)
              .slice(1)
              .map((segment, index, segments) => {
                // Skip 'dashboard' segment as we already have it as the first item
                if (segment === "dashboard") return null;

                const segmentPath = `/dashboard/${segments
                  .slice(0, index + 1)
                  .join("/")}`;
                const decodedSegment = decodeURIComponent(segment);
                const formattedSegment =
                  decodedSegment.charAt(0).toUpperCase() +
                  decodedSegment.slice(1);

                return (
                  <React.Fragment key={segmentPath}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {index === segments.length - 1 ? (
                        <BreadcrumbPage>{formattedSegment}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={segmentPath}>
                          {formattedSegment}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
