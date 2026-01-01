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
                <label className="block text-sm font-semibold text-slate-300">
                    Description *
                </label>
                <textarea
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Describe the coding standard or guideline..."
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none">
                </textarea>
                <p className="text-xs text-slate-500">
                    {description.length} characters
                </p>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                    Reference URL (Optional)
                </label>
                <input
                    type="url"
                    value={url || ''}
                    onChange={(e) => onUrlChange(e.target.value)}
                    placeholder="https://example.com/style-guide"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                </input>
            </div>
        </div>
    );
}
