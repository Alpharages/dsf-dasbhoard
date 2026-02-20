import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { AIDecisionLog } from '../types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface DecisionDetailModalProps {
  log: AIDecisionLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DecisionDetailModal: React.FC<DecisionDetailModalProps> = ({ log, isOpen, onClose }) => {
  if (!log) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>Decision Details: {log.action}</DialogTitle>
              <DialogDescription>
                Agent: {log.agent_name} | Date: {new Date(log.timestamp).toLocaleString()}
              </DialogDescription>
            </div>
            <Badge variant={log.confidence >= 0.8 ? 'default' : log.confidence >= 0.5 ? 'secondary' : 'destructive'}>
              Confidence: {(log.confidence * 100).toFixed(1)}%
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <section>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">Reasoning</h3>
            <p className="text-sm p-4 bg-secondary/50 rounded-lg border border-border">
              {log.reasoning}
            </p>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <section>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Input Data</h3>
              <div className="rounded-lg overflow-hidden border border-border h-64">
                <SyntaxHighlighter
                  language="json"
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, height: '100%', fontSize: '0.75rem' }}
                >
                  {JSON.stringify(log.input_data, null, 2)}
                </SyntaxHighlighter>
              </div>
            </section>
            
            <section>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Output Data</h3>
              <div className="rounded-lg overflow-hidden border border-border h-64">
                <SyntaxHighlighter
                  language="json"
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, height: '100%', fontSize: '0.75rem' }}
                >
                  {JSON.stringify(log.output_data, null, 2)}
                </SyntaxHighlighter>
              </div>
            </section>
          </div>

          <section className="flex gap-6 mt-4 text-sm text-muted-foreground border-t border-border pt-4">
            {log.model_used && (
              <div>
                <span className="font-semibold">Model:</span> {log.model_used}
              </div>
            )}
            {log.prompt_tokens !== undefined && (
              <div>
                <span className="font-semibold">Prompt Tokens:</span> {log.prompt_tokens.toLocaleString()}
              </div>
            )}
            {log.completion_tokens !== undefined && (
              <div>
                <span className="font-semibold">Completion Tokens:</span> {log.completion_tokens.toLocaleString()}
              </div>
            )}
            {log.execution_id && (
              <div>
                <span className="font-semibold">Execution ID:</span> <span className="font-mono text-xs">{log.execution_id}</span>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};
