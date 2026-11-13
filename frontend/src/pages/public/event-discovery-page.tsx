import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { useEventsQuery } from "@/features/events/hooks/useEvents";
import { EventFilters, FilterState } from "@/features/events/components/event-filters";
import { EventCard } from "@/features/events/components/event-card";
import { EventGridSkeleton } from "@/features/events/components/event-card-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/utils/use-debounce";
import { EventCategory, EventSortField } from "@/types/event.types";
import { getApiErrorMessage } from "@/services/api-client";
import { Compass, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";

export function EventDiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract query parameters from URL with defaults
  const urlPage = parseInt(searchParams.get("page") || "1", 10);
  const urlCategory = (searchParams.get("category") || "") as EventCategory | "";
  const urlCity = searchParams.get("city") || "";
  const urlQuery = searchParams.get("q") || "";
  const urlSort = (searchParams.get("sort") || "dateTime") as EventSortField;
  const urlUpcoming = searchParams.get("upcoming") !== "false"; // Default to upcoming=true

  // Local filter state for immediate UI feedback
  const [filters, setFilters] = React.useState<FilterState>({
    q: urlQuery,
    city: urlCity,
    category: urlCategory,
    sort: urlSort,
    upcomingOnly: urlUpcoming,
  });

  // Debounce search query to prevent spamming backend regex queries
  const debouncedQ = useDebounce(filters.q, 350);

  // Track previous filter state to detect filter changes and reset pagination to page 1
  const prevFiltersRef = React.useRef({
    q: debouncedQ,
    city: filters.city,
    category: filters.category,
    sort: filters.sort,
    upcomingOnly: filters.upcomingOnly,
  });

  const isMountedRef = React.useRef(false);

  // Sync state to URL search parameters whenever debounced filters or page change
  React.useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    const filterChanged =
      prevFiltersRef.current.q !== debouncedQ ||
      prevFiltersRef.current.city !== filters.city ||
      prevFiltersRef.current.category !== filters.category ||
      prevFiltersRef.current.sort !== filters.sort ||
      prevFiltersRef.current.upcomingOnly !== filters.upcomingOnly;

    prevFiltersRef.current = {
      q: debouncedQ,
      city: filters.city,
      category: filters.category,
      sort: filters.sort,
      upcomingOnly: filters.upcomingOnly,
    };

    const nextParams = new URLSearchParams();
    if (debouncedQ) nextParams.set("q", debouncedQ);
    if (filters.city) nextParams.set("city", filters.city);
    if (filters.category) nextParams.set("category", filters.category);
    if (filters.sort && filters.sort !== "dateTime") nextParams.set("sort", filters.sort);
    if (!filters.upcomingOnly) nextParams.set("upcoming", "false");

    // When filters change, reset pagination to 1 (omit page). If no filters changed and urlPage > 1, keep page.
    if (!filterChanged && urlPage > 1) {
      nextParams.set("page", String(urlPage));
    }

    setSearchParams(nextParams, { replace: true });
  }, [debouncedQ, filters.city, filters.category, filters.sort, filters.upcomingOnly, urlPage, setSearchParams]);

  // Construct query parameters for the backend GET /api/events API call
  const queryParams = React.useMemo(() => {
    // If a filter change is pending in the effect, query page 1
    const filterChanged =
      prevFiltersRef.current.q !== debouncedQ ||
      prevFiltersRef.current.city !== filters.city ||
      prevFiltersRef.current.category !== filters.category ||
      prevFiltersRef.current.sort !== filters.sort ||
      prevFiltersRef.current.upcomingOnly !== filters.upcomingOnly;

    const activePage = filterChanged ? 1 : urlPage;

    const p: Parameters<typeof useEventsQuery>[0] = {
      page: activePage,
      limit: 9,
      sort: filters.sort,
    };

    if (debouncedQ) p.q = debouncedQ;
    if (filters.city) p.city = filters.city;
    if (filters.category) p.category = filters.category as EventCategory;
    if (filters.upcomingOnly) {
      p.from = new Date().toISOString();
    }

    return p;
  }, [urlPage, filters.sort, debouncedQ, filters.city, filters.category, filters.upcomingOnly]);

  const { data, isLoading, isError, error, refetch, isFetching } = useEventsQuery(queryParams);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      q: "",
      city: "",
      category: "",
      sort: "dateTime",
      upcomingOnly: true,
    });
    setSearchParams({}, { replace: true });
  };

  const handlePageChange = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newPage <= 1) {
      nextParams.delete("page");
    } else {
      nextParams.set("page", String(newPage));
    }
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalResults = data?.totalResults ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.currentPage ?? urlPage;
  const events = data?.data ?? [];

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header & Result Counter */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="mb-2">
            <Badge variant="default" size="sm">
              Discover
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-charcoal-900">
            Browse Events
          </h1>
          <p className="text-sm text-charcoal-500 mt-1">
            Discover community gatherings, workshops, concerts, and meetups
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-charcoal-500">
          {isFetching && (
            <span className="inline-flex items-center gap-1.5 text-coral-600 font-medium animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Updating feed...
            </span>
          )}
          <span>
            {isLoading ? "Searching events..." : `${totalResults} ${totalResults === 1 ? "event" : "events"} found`}
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <EventFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Content Feed */}
      {isLoading ? (
        <EventGridSkeleton count={6} />
      ) : isError ? (
        <div className="p-8 rounded-2xl bg-red-50/70 border border-red-200/80 text-center space-y-4 max-w-lg mx-auto">
          <div className="h-12 w-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-subtle">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-charcoal-900">
              Unable to load events
            </h3>
            <p className="text-xs text-charcoal-600 mt-1 max-w-sm mx-auto">
              {getApiErrorMessage(error)}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mx-auto">
            Try Again
          </Button>
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<Compass className="h-6 w-6 text-coral-500" />}
          title="No events match your criteria"
          description="Try broadening your search, selecting all categories, or turning off the upcoming-only filter."
          action={
            <Button variant="secondary" size="sm" onClick={handleResetFilters}>
              Reset all filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-10">
          {/* Event Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-surface-border/60 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isFetching}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>

              <div className="text-xs font-medium text-charcoal-600">
                Page <span className="font-semibold text-charcoal-900">{currentPage}</span> of{" "}
                <span className="font-semibold text-charcoal-900">{totalPages}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isFetching}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
