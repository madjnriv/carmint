"use client";

import { routes } from "@/config/route";
import { AwaitedPageProps } from "@/config/types";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryStates } from "nuqs";
import { env } from "process";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps extends AwaitedPageProps {
  minMaxValues: any;
}

export const Sidebar = ({ minMaxValues, searchParams }: SidebarProps) => {
  const router = useRouter();
  const [filterCount, setFilterCount] = useState(0);

  const [queryStates, setQueryStates] = useQueryStates(
    {
      make: parseAsString.withDefault(""),
      model: parseAsString.withDefault(""),
      modelVariant: parseAsString.withDefault(""),
      minYear: parseAsString.withDefault(""),
      maxYear: parseAsString.withDefault(""),
      minPrice: parseAsString.withDefault(""),
      maxPrice: parseAsString.withDefault(""),
      minReading: parseAsString.withDefault(""),
      maxReading: parseAsString.withDefault(""),
      currency: parseAsString.withDefault(""),
      odoUnit: parseAsString.withDefault(""),
      transmission: parseAsString.withDefault(""),
      fuelType: parseAsString.withDefault(""),
      bodyType: parseAsString.withDefault(""),
      color: parseAsString.withDefault(""),
      doors: parseAsString.withDefault(""),
      seats: parseAsString.withDefault(""),
      ulezCompliance: parseAsString.withDefault(""),
    },
    {
      shallow: false,
    },
  );

  useEffect(() => {
    const filterCount = Object.entries(
      searchParams as Record<string, string>,
    ).filter(([key, value]) => key !== "page" && value).length;

    setFilterCount(filterCount);
  }, [searchParams]);

  const clearFilters = () => {
    const url = new URL(routes.inventory, env.NEXT_PUBLIC_APP);
    window.location.replace(url.toString());
    setFilterCount(0);
  };
  return (
    <div className="py-4 w-85 border-r border-muted block">
      <div>
        <div className="text-lg font-semibold flex justify-between px-4">
          <span>Filters</span>
          <Button
            type="button"
            onClick={clearFilters}
            aria-disabled={!filterCount}
            variant={"ghost"}
            className={cn(
              "cursor-pointer",
              !filterCount &&
                "disabled opacity-50 pointer-events-none cursor-default",
            )}
          >
            Clear all {filterCount ? `(${filterCount})` : null}
          </Button>
        </div>
      </div>
    </div>
  );
};
