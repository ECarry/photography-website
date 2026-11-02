"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
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
  dismissible?: boolean;
  handleOnly?: boolean;
}

export const ResponsiveModal = ({
  children,
  open,
  title,
  onOpenChange,
  className,
  dismissible = true,
  handleOnly = false,
}: ResponsiveModalProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        dismissible={dismissible}
        handleOnly={handleOnly}
      >
        <DrawerContent
          className={cn(
            "h-[94dvh] max-h-[94dvh] gap-0 overflow-hidden",
            className,
          )}
        >
          <DrawerHeader className="shrink-0 px-3 pb-3 pt-2 text-left">
            <DrawerTitle className="text-base">{title}</DrawerTitle>
            <DrawerDescription className="sr-only">
              Upload a photo and add its details.
            </DrawerDescription>
          </DrawerHeader>
          <div
            className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={className}
        onEscapeKeyDown={(event) => {
          if (!dismissible) {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(event) => {
          if (!dismissible) {
            event.preventDefault();
          }
        }}
        onInteractOutside={(event) => {
          if (!dismissible) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
