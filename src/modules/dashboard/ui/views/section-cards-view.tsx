"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

export function SectionCardsView() {
  const trpc = useTRPC();
  const { data: stats } = useSuspenseQuery(
    trpc.dashboard.getDashboardStats.queryOptions()
  );
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Photos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalPhotos.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.thisYearPercentChange >= 0 ? (
                <>
                  <IconTrendingUp />+{stats.thisYearPercentChange}%
                </>
              ) : (
                <>
                  <IconTrendingDown />
                  {stats.thisYearPercentChange}%
                </>
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.thisYearPercentChange >= 0
              ? "Growth this year"
              : "Decline this year"}{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {Math.abs(stats.thisYearPercentChange)}%{" "}
            {stats.thisYearPercentChange >= 0 ? "increase" : "decrease"} vs last
            year
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>This Year Photos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.thisYearPhotos.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.thisYearPercentChange >= 0 ? (
                <>
                  <IconTrendingUp />+{stats.thisYearPercentChange}%
                </>
              ) : (
                <>
                  <IconTrendingDown />
                  {stats.thisYearPercentChange}%
                </>
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.thisYearPercentChange >= 0
              ? "Year-over-year growth"
              : "Year-over-year decline"}{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {Math.abs(stats.thisYearPercentChange)}%{" "}
            {stats.thisYearPercentChange >= 0 ? "increase" : "decrease"} vs last
            year
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Countries Visited</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalCountries}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.countriesPercentChange >= 0 ? (
                <>
                  <IconTrendingUp />+{stats.countriesPercentChange}%
                </>
              ) : (
                <>
                  <IconTrendingDown />
                  {stats.countriesPercentChange}%
                </>
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.countriesPercentChange >= 0
              ? "New countries"
              : "Countries decreased"}{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {Math.abs(stats.countriesPercentChange)}%{" "}
            {stats.countriesPercentChange >= 0 ? "increase" : "decrease"} vs
            last year
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Cities</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalCities}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.citiesPercentChange >= 0 ? (
                <>
                  <IconTrendingUp />+{stats.citiesPercentChange}%
                </>
              ) : (
                <>
                  <IconTrendingDown />
                  {stats.citiesPercentChange}%
                </>
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.citiesPercentChange >= 0 ? "New cities" : "Cities decreased"}{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {Math.abs(stats.citiesPercentChange)}%{" "}
            {stats.citiesPercentChange >= 0 ? "increase" : "decrease"} vs last
            year
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export const SectionCardsLoading = () => {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="@container/card">
          <CardHeader>
            <CardDescription>
              <Skeleton className="h-4 w-20" />
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              <Skeleton className="h-8 w-32 mt-2" />
            </CardTitle>
            <CardAction>
              <Skeleton className="h-8 w-24" />
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="text-muted-foreground">
              <Skeleton className="h-4 w-32" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
