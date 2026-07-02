import { useRef, useState } from 'react';
import { Upload, Copy, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { canAccess } from '@/utils/roleHelpers';
import {
  useAiAccounts,
  useClaudeSessions,
  useImportAiAccounts,
  useSetAiAccountEnabled,
} from '@/hooks/queries/useAiAccounts';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AiAccount, ClaudeSessionInfo, ClaudeSessionStatus } from '@/types/aiAccounts';

const quotaSummary = (config: unknown): string => {
  if (!config || typeof config !== 'object') return '—';
  const entries = Object.entries(config as Record<string, unknown>);
  if (entries.length === 0) return '—';
  return entries.map(([k, v]) => `${k}: ${v}`).join(', ');
};

const AiAccountRow = ({ account, readOnly }: { account: AiAccount; readOnly: boolean }) => {
  const setEnabled = useSetAiAccountEnabled();
  return (
    <TableRow>
      <TableCell className="font-medium text-foreground">{account.label}</TableCell>
      <TableCell className="text-muted-foreground">{account.provider}</TableCell>
      <TableCell className="text-muted-foreground">{account.runtime}</TableCell>
      <TableCell className="text-muted-foreground text-xs">{quotaSummary(account.quota_config)}</TableCell>
      <TableCell>
        <Switch
          checked={account.enabled}
          disabled={readOnly || setEnabled.isPending}
          onCheckedChange={(checked) => setEnabled.mutate({ id: account.id, enabled: checked })}
        />
      </TableCell>
    </TableRow>
  );
};

const SESSION_BADGE: Record<ClaudeSessionStatus, { label: string; cls: string }> = {
  active: { label: 'Active', cls: 'bg-green-500/15 text-green-600 dark:text-green-400' },
  expiring: { label: 'Expiring soon', cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  expired: { label: 'Expired', cls: 'bg-red-500/15 text-red-600 dark:text-red-400' },
  missing: { label: 'Not logged in', cls: 'bg-red-500/15 text-red-600 dark:text-red-400' },
  unknown: { label: 'Unknown', cls: 'bg-muted text-muted-foreground' },
};

const fmtDate = (iso: string | null): string => (iso ? new Date(iso).toLocaleString() : '—');

/** One-time login command for an account, with copy-to-clipboard. */
const LoginCommand = ({ id }: { id: string }) => {
  const [copied, setCopied] = useState(false);
  const cmd = `scripts/claude-account-login.sh ${id}`;
  const copy = () => {
    void navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      title="Copy the one-time login command"
      className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
      <span className="truncate">{cmd}</span>
    </button>
  );
};

const ClaudeSessionsSubsection = ({ canView }: { canView: boolean }) => {
  const { data: sessions, isLoading, isError } = useClaudeSessions(canView);
  if (!canView) return null;

  const needsAttention = (sessions ?? []).some(
    (s) => s.status === 'missing' || s.status === 'expired',
  );

  return (
    <div className="mt-8">
      <h3 className="text-md font-semibold text-foreground mb-1">Claude Login Sessions</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Each Claude account runs under its own subscription login. Log in once per account (a browser
        opens); runs then reuse the saved session automatically. Re-login when a session is expired
        or missing — copy an account&apos;s command and run it in the backend shell.
      </p>

      {isError && (
        <div className="text-sm text-destructive">Failed to load Claude session status.</div>
      )}
      {isLoading && <div className="text-sm text-muted-foreground">Loading sessions…</div>}

      {sessions && sessions.length === 0 && (
        <div className="text-sm text-muted-foreground">No Claude accounts in the pool yet.</div>
      )}

      {sessions && sessions.length > 0 && (
        <>
          {needsAttention && (
            <div className="mb-3 text-sm text-amber-600 dark:text-amber-400">
              One or more Claude accounts need a login — runs routed to them will fail until
              re-authenticated.
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead>Login command</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s: ClaudeSessionInfo) => {
                const badge = SESSION_BADGE[s.status];
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-foreground">
                      {s.label}
                      {!s.enabled && (
                        <span className="ml-2 text-xs text-muted-foreground">(disabled)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{s.email ?? '—'}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {fmtDate(s.expiresAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {fmtDate(s.lastLoginAt)}
                    </TableCell>
                    <TableCell>
                      <LoginCommand id={s.id} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
};

export const AiAccountsSection = () => {
  const { user } = useAuth();
  const canView = canAccess(user?.role || 'VIEWER', 'ADMIN'); // pool is ADMIN-only
  const { data: accounts, isLoading, isError } = useAiAccounts(canView);
  const importCsv = useImportAiAccounts();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  if (!canView) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    importCsv.mutate(file, {
      // Allow re-selecting the same file name to re-trigger onChange.
      onSettled: () => {
        if (fileRef.current) fileRef.current.value = '';
      },
    });
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-foreground mb-1">AI Account Pool</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Multi-account credential pool for Claude and OpenAI/ChatGPT runs. Import accounts from a CSV
        (encrypted at rest — credentials are never displayed). Disabled accounts are skipped by the
        load balancer.
      </p>

      <div className="mb-4">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={importCsv.isPending}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-lg transition-all disabled:opacity-50"
        >
          <Upload className="w-3 h-3" />
          {importCsv.isPending ? 'Importing...' : 'Import CSV'}
        </button>

        {importCsv.data && (
          <div className="mt-3 text-sm text-muted-foreground">
            Last import{fileName ? ` (${fileName})` : ''}: {importCsv.data.imported} imported,{' '}
            {importCsv.data.skipped} skipped.
            {importCsv.data.errors.length > 0 && (
              <ul className="mt-1 list-disc list-inside text-destructive">
                {importCsv.data.errors.map((err) => (
                  <li key={err.row}>
                    Row {err.row}: {err.reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {isError && <div className="text-sm text-destructive">Failed to load the account pool.</div>}
      {isLoading && <div className="text-sm text-muted-foreground">Loading accounts…</div>}

      {accounts && accounts.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No accounts yet. Import a CSV to populate the pool.
        </div>
      )}

      {accounts && accounts.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Runtime</TableHead>
              <TableHead>Quota</TableHead>
              <TableHead>Enabled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <AiAccountRow key={account.id} account={account} readOnly={false} />
            ))}
          </TableBody>
        </Table>
      )}

      <ClaudeSessionsSubsection canView={canView} />
    </div>
  );
};
