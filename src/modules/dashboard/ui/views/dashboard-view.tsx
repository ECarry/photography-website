import { SectionCards } from "../components/section-cards";
import { ChartAreaInteractive } from "../components/chart-area-interactive";
import Mapbox from "@/modules/mapbox/ui/components/map";

export const DashboardView = () => {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <ChartAreaInteractive />
        <div className="w-full h-[500px] rounded-xl overflow-hidden relative">
          <Mapbox
            id="dashboardMap"
            initialViewState={{
              longitude: 121.2816980216146,
              latitude: 31.31395498607465,
              zoom: 1,
            }}
          />
        </div>
      </div>
    </div>
  );
};
