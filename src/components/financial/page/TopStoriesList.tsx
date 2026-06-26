/**
 * Top Stories List
 * Ranked list of most expensive stories with drill-down capability
 */

import { useState } from 'react';

import { StoryDrillDownModal } from './StoryDrillDownModal';

interface Story {
    id: string;
    title: string;
    epicId: string;
    cost: number;
}

interface TopStoriesListProps {
    projectId: string | null;
}

export function TopStoriesList(_props: TopStoriesListProps) {
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);

    // Mock data - in production, fetch from API
    const topStories: Story[] = [
        { id: '1', title: 'Authentication System Implementation', epicId: 'epic-1', cost: 1250 },
        { id: '2', title: 'Payment Gateway Integration', epicId: 'epic-2', cost: 980 },
        { id: '3', title: 'Real-time Analytics Dashboard', epicId: 'epic-3', cost: 875 },
        { id: '4', title: 'Advanced Search Functionality', epicId: 'epic-1', cost: 720 },
        { id: '5', title: 'Multi-tenant Architecture', epicId: 'epic-4', cost: 650 },
        { id: '6', title: 'API Rate Limiting', epicId: 'epic-2', cost: 580 },
        { id: '7', title: 'Email Notification System', epicId: 'epic-3', cost: 520 },
        { id: '8', title: 'File Upload & Processing', epicId: 'epic-1', cost: 480 },
        { id: '9', title: 'User Role Management', epicId: 'epic-4', cost: 450 },
        { id: '10', title: 'Audit Logging System', epicId: 'epic-2', cost: 420 },
    ];

    return (
        <div className="space-y-3">
            {topStories.map((story, index) => (
                <button
                    key={story.id}
                    onClick={() => setSelectedStory(story)}
                    className="w-full flex items-center justify-between p-4 bg-background border border-border rounded-xl hover:border-blue-600/50 transition-all text-left group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600/10 border border-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-blue-500">#{index + 1}</span>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-blue-400 transition-colors">
                                {story.title}
                            </div>
                            {story.epicId != null && story.epicId !== '' && (
                                <div className="text-xs text-muted-foreground">Epic {story.epicId}</div>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-foreground">${story.cost}</div>
                        <div className="text-xs text-muted-foreground">total cost</div>
                    </div>
                </button>
            ))}

            {selectedStory && (
                <StoryDrillDownModal
                    isOpen={!!selectedStory}
                    onClose={() => setSelectedStory(null)}
                    story={selectedStory}
                />
            )}
        </div>
    );
}
