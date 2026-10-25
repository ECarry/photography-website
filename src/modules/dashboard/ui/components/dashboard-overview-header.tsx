"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";

export function DashboardOverviewHeader() {
  const modal = useModal();

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-medium tracking-[0.08em] text-[#8F8F8F]">
          COLLECTION
        </p>
        <h1 className="mt-2 text-[28px] font-semibold leading-9 tracking-[-1.12px] text-[#171717] dark:text-[#FAFAFA] sm:text-[32px] sm:leading-10 sm:tracking-[-1.28px]">
          Overview
        </h1>
        <p className="mt-1 text-sm text-[#4D4D4D] dark:text-[#B3B3B3]">
          Your photographs and travel history, at a glance.
        </p>
      </div>
      <Button
        type="button"
        onClick={modal.onOpen}
        className="h-10 w-full rounded-md bg-[#0072F5] px-4 text-sm font-medium text-white shadow-none hover:bg-[#005FCC] focus-visible:ring-2 focus-visible:ring-[#0072F5] focus-visible:ring-offset-2 sm:w-auto"
      >
        <Plus className="size-4" />
        Add photos
      </Button>
    </header>
  );
}
