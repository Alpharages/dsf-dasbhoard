import React from 'react';
import GaugeComponent from 'react-gauge-component';

interface QaSummary {
    linting_passed: boolean;
    tests_passed: boolean;
    test_coverage: number;
    quality_score: number; // pr-agent score or similar
}

interface QualityGateSummaryProps {
    summary: QaSummary;
}

export const QualityGateSummary: React.FC<QualityGateSummaryProps> = ({ summary }) => {
    return (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-slate-100 mb-6">Quality Gate Summary</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Linting Status */}
                <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-slate-400 mb-2">Linting</span>
                    <div className={`px-4 py-2 rounded-full text-sm font-bold ${summary.linting_passed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                        {summary.linting_passed ? 'PASSED' : 'FAILED'}
                    </div>
                </div>

                {/* Tests Status */}
                <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-slate-400 mb-2">Tests</span>
                    <div className={`px-4 py-2 rounded-full text-sm font-bold ${summary.tests_passed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                        {summary.tests_passed ? 'PASSED' : 'FAILED'}
                    </div>
                </div>

                {/* Coverage Gauge */}
                <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-slate-400 mb-2">Coverage</span>
                    <div className="w-24 h-24">
                        <GaugeComponent
                            value={summary.test_coverage}
                            type="semicircle"
                            arc={{
                                colorArray: ['#F43F5E', '#10B981'],
                                padding: 0.02,
                                subArcs: [{ limit: 70 }, { limit: 100 }]
                            }}
                            labels={{
                                valueLabel: { formatTextValue: (v) => `${v}%`, style: { fill: '#F1F5F9', textShadow: 'none' } }
                            }}
                        />
                    </div>
                </div>

                {/* Quality Score Gauge */}
                <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-slate-400 mb-2">Review Score</span>
                    <div className="w-24 h-24">
                        <GaugeComponent
                            value={summary.quality_score}
                            type="semicircle"
                            arc={{
                                colorArray: ['#F59E0B', '#10B981'],
                                padding: 0.02,
                                subArcs: [{ limit: 60 }, { limit: 100 }]
                            }}
                            labels={{
                                valueLabel: { formatTextValue: (v) => v, style: { fill: '#F1F5F9', textShadow: 'none' } }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
