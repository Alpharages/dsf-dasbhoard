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
        const end = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${start} - ${end}`;
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 rounded-xl font-medium transition-all"
            >
                <Calendar className="w-4 h-4" />
                {formatDateRange()}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
                    <div className="absolute top-full mt-2 right-0 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-20 min-w-[250px]">
                        {!showCustom ? (
                            <div>
                                {PRESETS.map((preset) => (
                                    <button
                                        key={preset.label}
                                        onClick={() => handlePresetClick(preset.days)}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors text-slate-300 text-sm"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setShowCustom(true)}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors text-blue-400 text-sm font-semibold border-t border-slate-800"
                                >
                                    Custom Range
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 space-y-4 bg-slate-950">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-2">Start Date</label>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date: Date | null) => date && onChange({ startDate: date, endDate })}
                                        selectsStart
                                        startDate={startDate}
                                        endDate={endDate}
                                        maxDate={endDate}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-2">End Date</label>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={(date: Date | null) => date && onChange({ startDate, endDate: date })}
                                        selectsEnd
                                        startDate={startDate}
                                        endDate={endDate}
                                        minDate={startDate}
                                        maxDate={new Date()}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-sm"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        setShowCustom(false);
                                        setIsOpen(false);
                                    }}
                                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
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
