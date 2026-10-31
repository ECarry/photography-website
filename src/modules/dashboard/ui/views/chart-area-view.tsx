"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

export const description = "Monthly photo count chart";

const chartConfig = {
  photos: {
    label: "Photos",
    theme: {
      light: "#171717",
      dark: "#FAFAFA",
    },
  },
} satisfies ChartConfig;

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function ChartAreaView() {
  const trpc = useTRPC();
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("3y");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("1y");
    }
  }, [isMobile]);

  // Get years from timeRange
  const years = React.useMemo(() => {
    switch (timeRange) {
      case "1y":
        return 1;
      case "3y":
        return 3;
      case "5y":
        return 5;
      default:
        return 3;
    }
  }, [timeRange]);

  const { data: photosCountByMonth } = useSuspenseQuery(
    trpc.dashboard.getPhotosCountByMonth.queryOptions({ years })
  );

  // Transform data for chart
  const chartData = React.useMemo(() => {
    return photosCountByMonth.map((item) => ({
      date: item.month + "-01", // Add day for proper date parsing
      photos: item.count,
    }));
  }, [photosCountByMonth]);

  // Calculate total photos and peak month
  const totalPhotos = React.useMemo(() => {
    return photosCountByMonth.reduce((sum, item) => sum + item.count, 0);
  }, [photosCountByMonth]);

  const peakMonth = React.useMemo(() => {
    if (photosCountByMonth.length === 0) return null;
    const peak = photosCountByMonth.reduce((max, item) =>
      item.count > max.count ? item : max
    );
    return {
      month: monthFormatter.format(new Date(`${peak.month}-01T00:00:00Z`)),
      count: peak.count,
    };
  }, [photosCountByMonth]);

  return (
    <Card className="@container/card flex h-full flex-col rounded-xl border-0 bg-white py-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
      <CardHeader className="grid-cols-[1fr_auto] px-5 pt-5 sm:px-6 sm:pt-6">
        <CardTitle className="text-[14px] font-medium tracking-[-0.28px] text-[#171717] dark:text-[#FAFAFA]">
          Photo activity
        </CardTitle>
        <CardDescription className="text-xs text-[#8F8F8F]">
          {totalPhotos.toLocaleString()} photos in the last {years}{" "}
          {years === 1 ? "year" : "years"}
          {peakMonth && ` · Peak ${peakMonth.month} (${peakMonth.count})`}
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-3! @[767px]/card:flex"
          >
            <ToggleGroupItem value="1y">1 Year</ToggleGroupItem>
            <ToggleGroupItem value="3y">3 Years</ToggleGroupItem>
            <ToggleGroupItem value="5y">5 Years</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-32 rounded-md shadow-[0_0_0_1px_rgba(0,0,0,0.08)] **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select chart range"
            >
              <SelectValue placeholder="3 years" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="1y">1 year</SelectItem>
              <SelectItem value="3y">3 years</SelectItem>
              <SelectItem value="5y">5 years</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1 px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
        <ChartContainer
          config={chartConfig}
          className="h-[280px] w-full"
        >
          <AreaChart data={chartData}>
            <CartesianGrid
              vertical={false}
              stroke="#EBEBEB"
              strokeDasharray="0"
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tick={{ fill: "#8F8F8F", fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(`${String(value).slice(0, 7)}-01T00:00:00Z`);
                return years > 1
                  ? new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      year: "2-digit",
                      timeZone: "UTC",
                    }).format(date)
                  : new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      timeZone: "UTC",
                    }).format(date);
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return monthFormatter.format(
                      new Date(`${String(value).slice(0, 7)}-01T00:00:00Z`),
                    );
                  }}
                  formatter={(value) => [
                    `${value} photo${value !== 1 ? "s" : ""}`,
                    "Photos",
                  ]}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="photos"
              type="monotone"
              fill="var(--color-photos)"
              fillOpacity={0.08}
              stroke="var(--color-photos)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export const ChartAreaLoading = () => {
  return (
    <Card className="@container/card h-full rounded-xl border-0 bg-white py-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
      <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
        <CardTitle className="text-[14px] font-medium tracking-[-0.28px]">
          Photo activity
        </CardTitle>
        <CardDescription className="text-xs">
          <Skeleton className="h-4 w-24" />
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={"3y"}
            onValueChange={() => {}}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="1y">1 Year</ToggleGroupItem>
            <ToggleGroupItem value="3y">3 Years</ToggleGroupItem>
            <ToggleGroupItem value="5y">5 Years</ToggleGroupItem>
          </ToggleGroup>
          <Select value={"3y"} onValueChange={() => {}}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="3 Years" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="1y" className="rounded-lg">
                1 Year
              </SelectItem>
              <SelectItem value="3y" className="rounded-lg">
                3 Years
              </SelectItem>
              <SelectItem value="5y" className="rounded-lg">
                5 Years
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        <Skeleton className="h-[280px] w-full rounded-md" />
      </CardContent>
    </Card>
  );
};
