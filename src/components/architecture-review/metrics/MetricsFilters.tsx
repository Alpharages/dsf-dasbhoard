import { format, subDays, startOfQuarter, startOfYear } from 'date-fns';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { Button } from '../../ui/button';
import { Calendar } from '../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { cn } from '../../../lib/utils';
import { useProjects } from '../../../hooks/api/useProjects';
import type { AdrMetricsFilters } from '../../../types/architectureReview';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

interface MetricsFiltersProps {
    filters: AdrMetricsFilters;
    onFilterChange: (filters: AdrMetricsFilters) => void;
    onExport: () => void;
}

export function MetricsFilters({ filters, onFilterChange, onExport }: MetricsFiltersProps) {
    const { data: projects } = useProjects();
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: filters.startDate ? new Date(filters.startDate) : undefined,
        to: filters.endDate ? new Date(filters.endDate) : undefined
    });

    const handleDateSelect = (range: DateRange | undefined) => {
        setDateRange(range);
        onFilterChange({
            ...filters,
            startDate: range?.from?.toISOString(),
            endDate: range?.to?.toISOString()
        });
    };

    const applyPreset = (preset: '7d' | '30d' | 'quarter' | 'ytd') => {
        let range: DateRange;
        const today = new Date();

        switch (preset) {
            case '7d':
                range = { from: subDays(today, 7), to: today };
                break;
            case '30d':
                range = { from: subDays(today, 30), to: today };
                break;
            case 'quarter':
                range = { from: startOfQuarter(today), to: today };
                break;
            case 'ytd':
                range = { from: startOfYear(today), to: today };
                break;
        }

        handleDateSelect(range);
    };

    const handleProjectChange = (projectId: string) => {
        if (projectId === 'all') {
            const { projectId: _, ...rest } = filters;
            onFilterChange(rest);
        } else {
            onFilterChange({ ...filters, projectId });
        }
    };

    const handleRiskChange = (riskLevel: string) => {
        if (riskLevel === 'all') {
            const { riskLevel: _, ...rest } = filters;
            onFilterChange(rest);
        } else {
            onFilterChange({ ...filters, riskLevel: riskLevel as 'HIGH' | 'MEDIUM' | 'LOW' });
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[280px] justify-start text-left font-normal",
                                !dateRange?.from && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 flex" align="start">
                        <div className="flex flex-col border-r bg-muted/50 p-2 gap-1 w-[140px]">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1">Presets</p>
                            <Button variant="ghost" size="sm" className="justify-start text-xs h-8" onClick={() => applyPreset('7d')}>
                                Last 7 Days
                            </Button>
                            <Button variant="ghost" size="sm" className="justify-start text-xs h-8" onClick={() => applyPreset('30d')}>
                                Last 30 Days
                            </Button>
                            <Button variant="ghost" size="sm" className="justify-start text-xs h-8" onClick={() => applyPreset('quarter')}>
                                This Quarter
                            </Button>
                            <Button variant="ghost" size="sm" className="justify-start text-xs h-8" onClick={() => applyPreset('ytd')}>
                                Year to Date
                            </Button>
                        </div>
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={handleDateSelect}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>

                <Select value={filters.projectId || 'all'} onValueChange={handleProjectChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Project" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {projects?.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filters.riskLevel || 'all'} onValueChange={handleRiskChange}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Risks</SelectItem>
                        <SelectItem value="HIGH">High Risk</SelectItem>
                        <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                        <SelectItem value="LOW">Low Risk</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button variant="outline" size="sm" onClick={onExport} className="ml-auto">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
            </Button>
        </div>
    );
}
