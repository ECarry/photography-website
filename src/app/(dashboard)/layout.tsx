import { Metadata } from "next";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/modules/dashboard/ui/components/site-header";
import CreatePhotoModal from "@/modules/photos/ui/components/create-photo-modal";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";

export const metadata: Metadata = {
  title: {
    template: "%s - Dashboard",
    default: "Dashboard",
  },
};

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "240px",
          "--header-height": "64px",
        } as React.CSSProperties
      }
    >
      <DashboardSidebar
        variant="sidebar"
        className="border-r border-[#EBEBEB] shadow-none dark:border-[#303030]"
      />
      <SidebarInset className="border-l-0 border-t-0 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        <SiteHeader />
        {children}
        <CreatePhotoModal />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Layout;
