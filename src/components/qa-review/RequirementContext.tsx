import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ClipboardList } from 'lucide-react';

interface RequirementContextProps {
  title: string;
  description: string;
}

export const RequirementContext: React.FC<RequirementContextProps> = ({ title, description }) => {
  return (
    <Card className="bg-slate-900/50 border-slate-800 rounded-2xl overflow-hidden h-full">
      <CardHeader className="border-b border-slate-800/50 py-4 px-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <ClipboardList className="w-4 h-4 text-blue-400" />
          </div>
          <CardTitle className="text-sm font-bold text-slate-100 line-clamp-1">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 overflow-y-auto max-h-[400px]">
        <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-400 prose-headings:text-slate-200">
          <ReactMarkdown>{description}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};
