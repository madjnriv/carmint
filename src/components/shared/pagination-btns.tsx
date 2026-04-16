"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { env } from "@/env";
import { cn } from "@/lib/utils";

interface PaginationProps {
  baseURL: string;
  totalPages: number;
  maxVisiblePages?: number | undefined;
  styles: {
    root: string;
    link: string;
    activeLink: string;
    next: string;
    previous: string;
  };
}

export const PaginationBtns = (props: PaginationProps) => {
  const { baseURL, totalPages, maxVisiblePages = 5, styles } = props;
  const [currentPage, setCurrentPage] = useQueryState("page", {
    defaultValue: 1,
    parse: (value) => {
      const parsed = Number.parseInt(value, 10);
      return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
    },
    serialize: (value) => value.toString(),
    shallow: false,
  });
  const [visibleRange, setVisibleRange] = useState({
    start: 1,
    end: Math.min(maxVisiblePages, totalPages),
  });

  useEffect(() => {
    const halfVisible = Math.floor(maxVisiblePages / 2);
    const newStart = Math.max(
      1,
      Math.min(currentPage - halfVisible, totalPages - maxVisiblePages + 1),
    );
    const newEnd = Math.min(newStart + maxVisiblePages - 1, totalPages);
    setVisibleRange({ start: newStart, end: newEnd });
  }, [currentPage, totalPages, maxVisiblePages]);

  const createPageUrl = (pageNumber: number) => {
    const url = new URL(baseURL, env.NEXT_PUBLIC_APP_URL);
    url.searchParams.set("page", pageNumber.toString());
    return url.toString();
  };

  const handleEllipsisClick = (direction: "left" | "right") => {
    const newPage =
      direction === "left"
        ? Math.max(1, visibleRange.start - maxVisiblePages)
        : Math.min(totalPages, visibleRange.end + maxVisiblePages);
    setCurrentPage(newPage);
  };

  return (
    <Pagination className={styles.root}>
      <PaginationContent className="lg:gap-4">
        <PaginationItem>
          <PaginationPrevious
            className={cn(currentPage <= 1 && "hidden", styles.previous)}
            href={createPageUrl(currentPage - 1)}
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) setCurrentPage(currentPage - 1);
            }}
          />
        </PaginationItem>

        {visibleRange.start > 1 && (
          <PaginationItem className="hidden lg:block">
            <PaginationLink
              className={styles.link}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleEllipsisClick("left");
              }}
            >
              <PaginationEllipsis />
            </PaginationLink>
          </PaginationItem>
        )}

        {Array.from(
          { length: visibleRange.end - visibleRange.start + 1 },
          (_, index) => visibleRange.start + index,
        ).map((pageNumber) => {
          const isActive = pageNumber === currentPage;
          let rel = "";

          if (pageNumber === currentPage - 1) {
            rel = "prev";
          }

          if (pageNumber === currentPage + 1) {
            rel = "next";
          }
          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                isActive={isActive}
                href={createPageUrl(pageNumber)}
                {...(rel ? { rel } : {})}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(pageNumber);
                }}
                className={cn(styles.link, isActive && styles.activeLink)}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        {visibleRange.end < totalPages && (
          <PaginationItem className="hidden lg:block">
            <PaginationLink
              className={styles.link}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleEllipsisClick("right");
              }}
            >
              <PaginationEllipsis />
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            className={cn(currentPage >= totalPages && "hidden", styles.next)}
            href={createPageUrl(currentPage + 1)}
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) setCurrentPage(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
