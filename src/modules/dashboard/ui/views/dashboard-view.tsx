import { SectionCards } from "../components/section-cards";
import { ChartAreaInteractive } from "../components/chart-area-interactive";
import { MapWithCounties } from "../components/map-with-counties";

export const DashboardView = () => {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <ChartAreaInteractive />
        <MapWithCounties />
      </div>
    </div>
  );
};
