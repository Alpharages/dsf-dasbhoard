interface StandardInputProps {
    description: string;
    url?: string;
    onDescriptionChange: (description: string) => void;
    onUrlChange: (url: string) => void;
}

export function StandardInput({
    description,
    url,
    onDescriptionChange,
    onUrlChange
}: StandardInputProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                    Description *
                </label>
                <textarea
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Describe the coding standard or guideline..."
                    rows={4}
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none">
                </textarea>
                <p className="text-xs text-muted-foreground">
                    {description.length} characters
                </p>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                    Reference URL (Optional)
                </label>
                <input
                    type="url"
                    value={url || ''}
                    onChange={(e) => onUrlChange(e.target.value)}
                    placeholder="https://example.com/style-guide"
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500">
                </input>
            </div>
        </div>
    );
}
