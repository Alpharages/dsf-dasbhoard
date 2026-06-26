import React, { useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { FileCode, Maximize2, Minimize2, Split, Layout } from 'lucide-react';
import { Button } from '../ui/button';
import type { CodeDiff } from '../../types/qa-review';

interface CodeDiffViewerProps {
  diffs: CodeDiff[];
}

export const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({ diffs }) => {
  const [splitView, setSplitView] = useState(true);
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>(
    diffs.reduce((acc, d) => ({ ...acc, [d.fileName]: true }), {})
  );

  const toggleExpand = (fileName: string) => {
    setExpandedFiles(prev => ({ ...prev, [fileName]: !prev[fileName] }));
  };

  const styles = {
    variables: {
      dark: {
        diffViewerBackground: '#0f172a',
        diffViewerColor: '#cbd5e1',
        addedBackground: '#064e3b',
        addedColor: '#6ee7b7',
        removedBackground: '#7f1d1d',
        removedColor: '#fca5a5',
        wordAddedBackground: '#065f46',
        wordRemovedBackground: '#991b1b',
        addedGutterBackground: '#064e3b',
        removedGutterBackground: '#7f1d1d',
        gutterColor: '#475569',
        codeFoldGutterBackground: '#1e293b',
        codeFoldBackground: '#1e293b',
        codeFoldContentColor: '#94a3b8',
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <FileCode className="w-5 h-5 text-blue-400" />
          Code Changes ({diffs.length} files)
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSplitView(!splitView)}
          className="bg-card border-border text-muted-foreground hover:text-foreground rounded-xl gap-2"
        >
          {splitView ? <Layout className="w-4 h-4" /> : <Split className="w-4 h-4" />}
          {splitView ? 'Unified View' : 'Split View'}
        </Button>
      </div>

      <div className="space-y-4">
        {diffs.map((diff) => (
          <Card key={diff.fileName} className="bg-card/50 border-border rounded-lg overflow-hidden">
            <CardHeader 
              className="py-3 px-6 bg-card/80 border-b border-border flex flex-row items-center justify-between cursor-pointer group"
              onClick={() => toggleExpand(diff.fileName)}
            >
              <div className="flex items-center gap-3">
                <FileCode className="w-4 h-4 text-muted-foreground group-hover:text-blue-400 transition-colors" />
                <CardTitle className="text-sm font-mono text-foreground group-hover:text-foreground transition-colors">
                  {diff.fileName}
                </CardTitle>
                {diff.language && (
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground border-border">
                    {diff.language}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground transition-colors">
                {expandedFiles[diff.fileName] ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </CardHeader>
            {expandedFiles[diff.fileName] && (
              <CardContent className="p-0 overflow-x-auto">
                <ReactDiffViewer
                  oldValue={diff.oldCode}
                  newValue={diff.newCode}
                  splitView={splitView}
                  useDarkTheme
                  compareMethod={DiffMethod.WORDS}
                  styles={styles}
                  hideLineNumbers={false}
                />
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
