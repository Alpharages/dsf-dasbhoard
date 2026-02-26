/**
 * Date Range Picker Component
 * Custom range selector with presets
 */

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangePickerProps {
    startDate: Date;
    endDate: Date;
    onChange: (range: { startDate: Date; endDate: Date }) => void;
}

const PRESETS = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'This Quarter', days: 90 }, // Simplified
    { label: 'All Time', days: 365 },
];

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showCustom, setShowCustom] = useState(false);

    const handlePresetClick = (days: number) => {
        const end = new Date();
        const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        onChange({ startDate: start, endDate: end });
        setIsOpen(false);
    };

    const formatDateRange = () => {
        const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const end = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${start} - ${end}`;
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 h-10 bg-card border border-border text-foreground hover:border-foreground/20 rounded-lg font-medium transition-all w-[160px]"
            >
                <Calendar className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                <span className="truncate text-sm">{formatDateRange()}</span>
                <ChevronDown className={`w-4 h-4 flex-shrink-0 ml-auto text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => {
                            setIsOpen(false);
                            setShowCustom(false);
                        }}
                    />
                    <div className="absolute top-full mt-1 right-0 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-20 w-[220px]">
                        {!showCustom ? (
                            <div>
                                {PRESETS.map((preset) => (
                                    <button
                                        key={preset.label}
                                        onClick={() => handlePresetClick(preset.days)}
                                        className="w-full text-left px-3 py-2.5 hover:bg-muted transition-colors text-foreground text-sm"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setShowCustom(true)}
                                    className="w-full text-left px-3 py-2.5 hover:bg-muted transition-colors text-primary text-sm font-semibold border-t border-border"
                                >
                                    Custom Range
                                </button>
                            </div>
                        ) : (
                            <div className="p-3 space-y-3 bg-muted/30">
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Start Date</label>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date: Date | null) => date && onChange({ startDate: date, endDate })}
                                        selectsStart
                                        startDate={startDate}
                                        endDate={endDate}
                                        maxDate={endDate}
                                        className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">End Date</label>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={(date: Date | null) => date && onChange({ startDate, endDate: date })}
                                        selectsEnd
                                        startDate={startDate}
                                        endDate={endDate}
                                        minDate={startDate}
                                        maxDate={new Date()}
                                        className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground text-sm"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        setShowCustom(false);
                                        setIsOpen(false);
                                    }}
                                    className="w-full px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm font-semibold transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
