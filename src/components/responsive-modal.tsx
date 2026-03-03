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
        {/* Added overflow-hidden and max-h to the drawer */}
        <DrawerContent className="p-0 max-h-[95vh] overflow-hidden">
          <DrawerHeader className="p-4 border-b">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
          {/* Internal wrapper to handle scrolling */}
          <div className="overflow-y-auto p-4 flex-1">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Change: We force !flex and !flex-col here. 
         We also move padding p-6 from the dialog to an internal wrapper.
      */}
      <DialogContent
        className={cn(
          "!p-0 !max-h-[90vh] !flex !flex-col !grid-none overflow-hidden",
          className,
        )}
      >
        <DialogHeader className="p-6 border-b shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        {/* THIS IS THE KEY: A wrapper that takes all remaining space
           and forces scrolling.
        */}
        <div className="flex-1 overflow-y-auto min-h-0 w-full p-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
