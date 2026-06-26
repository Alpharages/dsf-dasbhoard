import React from 'react';
import GaugeComponent from 'react-gauge-component';

interface ConfidenceScoreGaugeProps {
    confidence: number; // 0.0 to 1.0 (will be converted to percentage)
    threshold?: number; // 0.0 to 1.0, defaults to 0.7 (70%)
}

export const ConfidenceScoreGauge: React.FC<ConfidenceScoreGaugeProps> = ({
    confidence,
    threshold = 0.7
}) => {
    const percentage = Math.round(confidence * 100);
    const thresholdPct = Math.round(threshold * 100);

    // Determine if we are in a "safe" (green) or "escalated" (red/yellow) state
    // Typically confidence < threshold is bad (escalated)
    const isEscalated = confidence < threshold;

    // Pointer color logic
    const pointerColor = isEscalated ? '#EF4444' : '#10B981';

    return (
        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-card/50 border border-border">
            <div className="w-24 relative">
                <GaugeComponent
                    type="semicircle"
                    arc={{
                        width: 0.2,
                        padding: 0.005,
                        cornerRadius: 1,
                        subArcs: [
                            {
                                limit: thresholdPct, // The "danger zone" (e.g. 0-70%)
                                color: '#EF4444',
                                showTick: false,
                                tooltip: { text: `Below Threshold (<${thresholdPct}%)` }
                            },
                            {
                                limit: 100, // The "safe zone" (e.g. 70-100%)
                                color: '#10B981',
                                showTick: false,
                                tooltip: { text: 'Above Threshold' }
                            }
                        ]
                    }}
                    pointer={{
                        color: pointerColor,
                        length: 0.8,
                        width: 15,
                        // elastic: true,
                    }}
                    labels={{
                        valueLabel: { formatTextValue: (val) => `${val}%`, style: { fill: '#ffffff', fontSize: '24px', fontWeight: 'bold' } },
                        tickLabels: {
                            type: "outer",
                            hideMinMax: true
                        }
                    }}
                    value={percentage}
                    minValue={0}
                    maxValue={100}
                />
            </div>

            <div className="text-xs text-center mt-[-10px]">
                {isEscalated ? (
                    <span className="text-red-400 font-medium flex items-center gap-1 justify-center">
                        ⚠️ Below {thresholdPct}%
                    </span>
                ) : (
                    <span className="text-emerald-400 font-medium">Safe</span>
                )}
            </div>
        </div>
    );
};
