import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DateRangePicker } from '@/components/financial/page/DateRangePicker';
import { X, Calendar } from 'lucide-react';

export interface ProjectFilters {
  statuses: string[];
  clientName: string;
  dateRange: { startDate: Date | null; endDate: Date | null };
}

interface ProjectFilterSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ProjectFilters;
  onFilterChange: (filters: ProjectFilters) => void;
  onClearFilters: () => void;
}

const STATUS_OPTIONS = ['Active', 'Paused', 'Completed', 'On Hold'];

export function ProjectFilterSheet({
  isOpen,
  onOpenChange,
  filters,
  onFilterChange,
  onClearFilters
}: ProjectFilterSheetProps) {
  const [localClientName, setLocalClientName] = useState(filters.clientName);

  // Sync prop changes to local state
  useEffect(() => {
    setLocalClientName(filters.clientName);
  }, [filters.clientName]);

  // Debounce client name
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localClientName !== filters.clientName) {
        onFilterChange({ ...filters, clientName: localClientName });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localClientName, filters, onFilterChange]);

  const toggleStatus = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onFilterChange({ ...filters, statuses: newStatuses });
  };

  const handleDateRangeChange = (range: { startDate: Date; endDate: Date }) => {
    onFilterChange({ ...filters, dateRange: range });
  };

  const clearDateRange = () => {
    onFilterChange({ ...filters, dateRange: { startDate: null, endDate: null } });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] border-l border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl flex flex-col">
        <SheetHeader className="px-1 py-4 border-b border-border text-left">
          <SheetTitle className="text-xl font-bold tracking-tight">Filter Projects</SheetTitle>
          <SheetDescription className="text-sm">
            Narrow down your project portfolio to focus on what matters.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-8 px-1">
          {/* Status Filter */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Project Status</h3>
            <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-xl border border-border/50">
              {STATUS_OPTIONS.map((status) => (
                <div key={status} className="flex items-center space-x-3">
                  <Checkbox
                    id={`status-${status}`}
                    checked={filters.statuses.includes(status)}
                    onCheckedChange={() => toggleStatus(status)}
                  />
                  <Label
                    htmlFor={`status-${status}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Client Filter */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Client</h3>
            <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
              <Input
                placeholder="Search by client name..."
                value={localClientName}
                onChange={(e) => setLocalClientName(e.target.value)}
                className="bg-background/50 focus:bg-background transition-colors h-11"
              />
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Date Range</h3>
              {(filters.dateRange.startDate || filters.dateRange.endDate) && (
                <button
                  onClick={clearDateRange}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center transition-colors px-2 py-1 rounded-md hover:bg-muted"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear Date
                </button>
              )}
            </div>
            <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
              {filters.dateRange.startDate || filters.dateRange.endDate ? (
                <DateRangePicker
                  startDate={filters.dateRange.startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
                  endDate={filters.dateRange.endDate ?? new Date()}
                  onChange={handleDateRangeChange}
                />
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-muted-foreground font-normal h-10"
                    onClick={() =>
                      handleDateRangeChange({
                        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        endDate: new Date(),
                      })
                    }
                  >
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    Select date range...
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    Select a date range to filter projects by their creation date.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <SheetFooter className="border-t border-border px-1 py-4 flex flex-row items-center justify-between sm:justify-between w-full">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted" onClick={onClearFilters}>
            Clear all filters
          </Button>
          <SheetClose asChild>
            <Button className="shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all">
              Done
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
