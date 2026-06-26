/**
 * Forecast Calendar
 * Visual calendar showing projected daily spend and budget exhaustion date
 */



interface ForecastCalendarProps {
    exhaustionDate: Date;
    dailyBurn: number;
}

export function ForecastCalendar({ exhaustionDate, dailyBurn }: ForecastCalendarProps) {
    // Generate next 30 days
    const days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
        const isExhaustionDate = date.toDateString() === exhaustionDate.toDateString();
        const projectedSpend = dailyBurn; // Use regular daily burn for projection

        return {
            date,
            day: date.getDate(),
            isToday: i === 0,
            isExhaustionDate,
            projectedSpend,
            severity: projectedSpend > dailyBurn * 1.2 ? 'high' : projectedSpend > dailyBurn ? 'medium' : 'low',
        };
    });

    return (
        <div>
            <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-muted-foreground uppercase">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {days.map((day, i) => (
                    <div
                        key={i}
                        className={`
                            aspect-square rounded-lg p-2 flex flex-col items-center justify-center transition-all
                            ${day.isExhaustionDate ? 'bg-red-500/20 border-2 border-red-500 ring-2 ring-red-500/50' :
                                day.isToday ? 'bg-blue-500/20 border border-blue-500' :
                                    day.severity === 'high' ? 'bg-amber-500/10 border border-amber-500/20' :
                                        day.severity === 'medium' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                                            'bg-card border border-border'}
                            hover:border-blue-500/50 cursor-pointer group
                        `}
                        title={`${day.date.toLocaleDateString()}: $${day.projectedSpend.toFixed(2)}`}
                    >
                        <div className={`text-xs font-bold ${day.isExhaustionDate ? 'text-red-400' : 'text-white'}`}>
                            {day.day}
                        </div>
                        <div className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                            ${day.projectedSpend.toFixed(0)}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500/20 border border-blue-500 rounded" />
                    <span className="text-muted-foreground">Today</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500/20 border-2 border-red-500 rounded" />
                    <span className="text-muted-foreground">Budget Exhaustion</span>
                </div>
            </div>
        </div>
    );
}
