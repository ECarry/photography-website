"use client";
import { cn } from "@/lib/utils";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResponsiveModalProps {
  children: React.ReactNode;
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

export const ResponsiveModal = ({
  children,
  open,
  title,
  onOpenChange,
  className,
}: ResponsiveModalProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        {/* Added overflow-hidden and max-h to the Drawer */}
        <DrawerContent className="max-h-[90vh] overflow-hidden flex flex-col">
          <DrawerHeader className="border-b shrink-0 p-4">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription />
          </DrawerHeader>
          {/* Internal scrollable wrapper for Mobile */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "p-0! max-h-[90vh]! flex! flex-col! !grid-none overflow-hidden",
          className,
        )}
      >
        <DialogHeader className="p-6 border-b shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        {/* Wrap the children in a scrollable flex-container */}
        <div className="flex-1 overflow-y-auto min-h-0 w-full p-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
