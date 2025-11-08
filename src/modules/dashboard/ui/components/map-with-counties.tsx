"use client";

import Mapbox from "@/modules/mapbox/ui/components/map";

export const MapWithCounties = () => {
  return (
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
  );
};
