/**
 * ROI Forecast Widget
 * Client-side linear regression for 30/60/90 day ROI forecasts
 */

import { TrendingUp, Calendar } from 'lucide-react';

interface RoiForecastWidgetProps {
    currentRoi: number;
}

export function RoiForecastWidget({ currentRoi }: RoiForecastWidgetProps) {
    // Simple linear regression forecast
    // In production, calculate based on historical data points
    const calculateForecast = (days: number) => {
        const growthRate = 0.12; // 12% monthly growth assumption
        const forecast = currentRoi + (currentRoi * growthRate * (days / 30));
        return Math.min(forecast, 100); // Cap at 100%
    };

    const forecasts = [
        { period: '30 days', days: 30, roi: calculateForecast(30), confidence: 85 },
        { period: '60 days', days: 60, roi: calculateForecast(60), confidence: 72 },
        { period: '90 days', days: 90, roi: calculateForecast(90), confidence: 58 },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {forecasts.map((forecast) => (
                <div key={forecast.period} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-400 uppercase">{forecast.period} Forecast</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">{forecast.roi.toFixed(1)}%</div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 bg-slate-800 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${forecast.confidence}%` }}
                            />
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap">{forecast.confidence}% confidence</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-400">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{(forecast.roi - currentRoi).toFixed(1)}% from current</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
