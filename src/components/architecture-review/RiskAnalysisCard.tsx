import React from 'react';
import type { RiskFactors } from '../../types/architectureReview';
import { Box, Boxes, Undo2, Brain, Activity, Info } from 'lucide-react';

interface RiskAnalysisCardProps {
    riskFactors: RiskFactors;
}

export const RiskAnalysisCard: React.FC<RiskAnalysisCardProps> = ({ riskFactors }) => {
    // Helper to determine color and icon based on factor values
    const getReversibilityConfig = (reversibility: RiskFactors['reversibility']) => {
        if (reversibility === 'irreversible') {
            return { color: 'text-rose-400', icon: Undo2, className: 'line-through decoration-2 decoration-rose-500/50' };
        }
        if (reversibility === 'migration-required') {
            return { color: 'text-amber-400', icon: Undo2, className: '' };
        }
        return { color: 'text-emerald-400', icon: Undo2, className: '' };
    };

    const getComplexityConfig = (complexity: RiskFactors['domain_complexity']) => {
        if (complexity === 'high') return { color: 'text-rose-400', icon: Brain };
        if (complexity === 'medium') return { color: 'text-amber-400', icon: Activity };
        return { color: 'text-emerald-400', icon: Activity };
    };

    const reversibilityConfig = getReversibilityConfig(riskFactors.reversibility);
    const complexityConfig = getComplexityConfig(riskFactors.domain_complexity);

    return (
        <div className="bg-card/50 border border-border rounded-xl p-4 my-2">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                Risk Analysis
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Scope */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-border/50">
                    <div className="p-2 bg-muted rounded-lg text-blue-400">
                        {riskFactors.scope === 'single-file' ? <Box className="w-4 h-4" /> : <Boxes className="w-4 h-4" />}
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Scope</div>
                        <div className="text-sm text-foreground font-medium capitalize">
                            {riskFactors.scope.replace('-', ' ')}
                        </div>
                    </div>
                </div>

                {/* Reversibility */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-border/50">
                    <div className={`p-2 bg-muted rounded-lg ${reversibilityConfig.color}`}>
                        <reversibilityConfig.icon className={`w-4 h-4`} />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Reversibility</div>
                        <div className={`text-sm text-foreground font-medium capitalize ${reversibilityConfig.className}`}>
                            {riskFactors.reversibility.replace('-', ' ')}
                        </div>
                    </div>
                </div>

                {/* Complexity */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-border/50">
                    <div className={`p-2 bg-muted rounded-lg ${complexityConfig.color}`}>
                        <complexityConfig.icon className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Complexity</div>
                        <div className="text-sm text-foreground font-medium capitalize">
                            {riskFactors.domain_complexity}
                        </div>
                    </div>
                </div>

                {/* Confidence */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-border/50">
                    <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                        <div className="w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                            %
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">AI Confidence</div>
                        <div className="text-sm text-foreground font-medium">
                            {Math.round(riskFactors.confidence * 100)}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
