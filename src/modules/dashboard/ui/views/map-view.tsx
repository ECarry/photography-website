"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import Mapbox from "@/modules/mapbox/ui/components/map";
import { useMemo } from "react";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const MapView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.dashboard.getVisitedCountriesWithGeoJson.queryOptions()
  );

  const chartConfig = {
    photoCount: {
      label: "Photos",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  // Use real data from database
  const countriesData = useMemo(() => data?.countries || [], [data]);

  // Prepare chart data for the bar chart using countryCode from database
  const chartData = countriesData
    .slice(0, 10) // Show top 10 countries
    .map((country) => ({
      country: country.country || "Unknown",
      countryShort: country.countryCode || "N/A",
      photoCount: country.photoCount,
    }));

  return (
    <div className="w-full h-[600px] grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-xl overflow-hidden relative h-[400px] lg:h-full">
        {false && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-sm text-muted-foreground">
              Loading world map data...
            </div>
          </div>
        )}
        <Mapbox
          id="dashboardMap"
          showControls={false}
          scrollZoom={false}
          doubleClickZoom={false}
          boxZoom={false}
          initialViewState={{
            longitude: 0,
            latitude: 20,
            zoom: 0,
          }}
          geoJsonData={data?.geoJson || undefined}
        />
      </div>

      {/* Country Statistics Chart */}
      <div className="lg:col-span-1 h-full">
        {countriesData && countriesData.length > 0 && (
          <Card className="h-full flex flex-col p-4">
            <CardHeader className="shrink-0 p-0 pb-3">
              <CardTitle className="text-lg">Countries by Photos</CardTitle>
              <CardDescription className="text-sm">
                Top {chartData.length} countries with most photos
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
              <ChartContainer config={chartConfig} className="flex-1 min-h-0">
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  layout="vertical"
                  margin={{
                    left: -15,
                    top: 5,
                    bottom: 5,
                  }}
                >
                  <XAxis type="number" dataKey="photoCount" hide />
                  <YAxis
                    dataKey="countryShort"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={50}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        labelFormatter={(label, payload) => {
                          const data = payload?.[0]?.payload;
                          return data?.country || label;
                        }}
                      />
                    }
                  />
                  <Bar
                    dataKey="photoCount"
                    fill="var(--color-photoCount)"
                    radius={5}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="shrink-0 flex-col items-start gap-1 text-sm p-0 pt-3">
              <div className="flex gap-2 leading-none font-medium">
                {countriesData.length} countries visited{" "}
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-muted-foreground leading-none">
                Total:{" "}
                {countriesData
                  .reduce((sum, c) => sum + c.photoCount, 0)
                  .toLocaleString()}{" "}
                photos
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};
