import * as React from "react";
import { EventCategory, EventSortField } from "@/types/event.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, X, ArrowUpDown, CalendarClock } from "lucide-react";
import { cn } from "@/utils/cn";

export interface FilterState {
  q: string;
  city: string;
  category: EventCategory | "";
  sort: EventSortField;
  upcomingOnly: boolean;
}

interface EventFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

const categories: { label: string; value: EventCategory | "" }[] = [
  { label: "All Events", value: "" },
  { label: "Tech", value: "tech" },
  { label: "Music", value: "music" },
  { label: "Sports", value: "sports" },
  { label: "Workshop", value: "workshop" },
  { label: "Other", value: "other" },
];

export function EventFilters({ filters, onFilterChange, onReset }: EventFiltersProps) {
  const [searchInput, setSearchInput] = React.useState(filters.q);
  const [cityInput, setCityInput] = React.useState(filters.city);

  // Sync external filter updates to local inputs
  React.useEffect(() => {
    setSearchInput(filters.q);
  }, [filters.q]);

  React.useEffect(() => {
    setCityInput(filters.city);
  }, [filters.city]);

  // Handle immediate inputs vs debounced trigger in page
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    onFilterChange({ ...filters, q: val });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCityInput(val);
    onFilterChange({ ...filters, city: val });
  };

  const handleCategorySelect = (category: EventCategory | "") => {
    onFilterChange({ ...filters, category });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, sort: e.target.value as EventSortField });
  };

  const handleUpcomingToggle = () => {
    onFilterChange({ ...filters, upcomingOnly: !filters.upcomingOnly });
  };

  const hasActiveFilters = Boolean(
    filters.q || filters.city || filters.category || !filters.upcomingOnly || filters.sort !== "dateTime"
  );

  return (
    <div className="space-y-4">
      {/* Search & City Input Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        <div className="lg:col-span-6">
          <Input
            placeholder="Search events by title..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchInput}
            onChange={handleSearchChange}
            className="bg-white shadow-subtle"
          />
        </div>

        <div className="lg:col-span-3">
          <Input
            placeholder="Filter by city..."
            leftIcon={<MapPin className="h-4 w-4" />}
            value={cityInput}
            onChange={handleCityChange}
            className="bg-white shadow-subtle"
          />
        </div>

        <div className="lg:col-span-3 flex items-center gap-2">
          <div className="relative w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal-500">
              <ArrowUpDown className="h-3.5 w-3.5" />
            </div>
            <select
              value={filters.sort}
              onChange={handleSortChange}
              aria-label="Sort events"
              className="w-full h-11 pl-9 pr-4 rounded-xl border border-surface-border bg-white text-xs font-medium text-charcoal-800 shadow-subtle focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500"
            >
              <option value="dateTime">Date: Earliest First</option>
              <option value="-dateTime">Date: Latest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="title">Title: A to Z</option>
              <option value="-createdAt">Recently Added</option>
            </select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-11 px-3 text-xs text-charcoal-500 hover:text-red-600 shrink-0"
              title="Clear all filters"
            >
              <X className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:inline">Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills & Upcoming Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => {
            const isActive = filters.category === cat.value;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => handleCategorySelect(cat.value)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all select-none border",
                  isActive
                    ? "bg-coral-500 text-white border-coral-500 shadow-sm"
                    : "bg-white text-charcoal-600 border-surface-border hover:bg-surface-subtle"
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Upcoming Only Toggle */}
        <button
          type="button"
          onClick={handleUpcomingToggle}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all select-none border",
            filters.upcomingOnly
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-white text-charcoal-500 border-surface-border hover:bg-surface-subtle"
          )}
        >
          <CalendarClock className="h-3.5 w-3.5" />
          <span>{filters.upcomingOnly ? "Upcoming Events" : "All Dates (Past & Future)"}</span>
        </button>
      </div>
    </div>
  );
}
