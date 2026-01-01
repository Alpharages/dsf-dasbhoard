import type { AdrDashboardMetrics } from '../types/architectureReview';

/**
 * Generates and downloads a CSV file from the provided metrics data.
 */
export function exportMetricsToCsv(metrics: AdrDashboardMetrics) {
    if (!metrics) return;

    const rows = [
        ['Metric', 'Current Value', 'Previous Value', 'Trend (%)'],
        ['Review Volume', metrics.summary.reviewVolume.current, metrics.summary.reviewVolume.previous, metrics.summary.reviewVolume.trend],
        ['Avg Review Time (min)', metrics.summary.averageReviewTimeMinutes.current, metrics.summary.averageReviewTimeMinutes.previous, metrics.summary.averageReviewTimeMinutes.trend],
        ['Queue Depth', metrics.summary.queueDepth.current, metrics.summary.queueDepth.previous, metrics.summary.queueDepth.trend],
        ['Est. Throughput (min)', metrics.summary.estimatedThroughputMinutes, '-', '-'],
        [],
        ['Insight Type', 'Message', 'Metric', 'Change (%)'],
        ...metrics.insights.map(i => [i.type, i.message, i.metric, i.change]),
        [],
        ['Risk Level', 'Count', 'Percentage (%)'],
        ...metrics.trends.riskDistribution.map(r => [r.level, r.count, r.percentage])
    ];

    const csvContent = "data:text/csv;charset=utf-8,"
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `adr_metrics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
