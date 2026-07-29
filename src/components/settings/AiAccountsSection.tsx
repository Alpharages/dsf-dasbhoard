import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Upload, Copy, Check, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { canAccess } from '@/utils/roleHelpers';
import {
  useAiAccounts,
  useClaudeSessions,
  useCreateAiAccount,
  useDeleteAiAccount,
  useImportAiAccounts,
  useSetAiAccountEnabled,
  useUpdateAiAccount,
} from '@/hooks/queries/useAiAccounts';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  AiAccount,
  AiAccountProvider,
  AiAccountRuntime,
  ClaudeSessionInfo,
  ClaudeSessionStatus,
} from '@/types/aiAccounts';

const quotaSummary = (config: unknown): string => {
  if (!config || typeof config !== 'object') return '—';
  const entries = Object.entries(config as Record<string, unknown>);
  if (entries.length === 0) return '—';
  return entries.map(([k, v]) => `${k}: ${v}`).join(', ');
};

/** The one credential key each provider needs (mirrors backend CREDENTIAL_KEYS). */
const CREDENTIAL_FIELD: Record<AiAccountProvider, { key: string; label: string; masked?: boolean }> = {
  claude: { key: 'email', label: 'Email' },
  openai: { key: 'token', label: 'API token', masked: true },
};

/** claude↔claude, openai↔oh — the only valid pairings (mirrors backend expectedRuntime). */
const RUNTIME_FOR_PROVIDER: Record<AiAccountProvider, AiAccountRuntime> = {
  claude: 'claude',
  openai: 'oh',
};

const parseQuotaConfig = (text: string): { value?: Record<string, unknown>; error?: string } => {
  const trimmed = text.trim();
  if (!trimmed) return { value: undefined };
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { error: 'Quota config must be a JSON object' };
    }
    return { value: parsed };
  } catch {
    return { error: 'Quota config must be valid JSON' };
  }
};

const AddAccountDialog = () => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [provider, setProvider] = useState<AiAccountProvider>('claude');
  const [credentialValue, setCredentialValue] = useState('');
  const [quotaText, setQuotaText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createAccount = useCreateAiAccount();

  const reset = () => {
    setLabel('');
    setProvider('claude');
    setCredentialValue('');
    setQuotaText('');
    setError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !credentialValue.trim()) {
      setError('Label and credential are required.');
      return;
    }
    const { value: quota_config, error: quotaError } = parseQuotaConfig(quotaText);
    if (quotaError) {
      setError(quotaError);
      return;
    }
    setError(null);
    createAccount.mutate(
      {
        label: label.trim(),
        provider,
        runtime: RUNTIME_FOR_PROVIDER[provider],
        credentials: { [CREDENTIAL_FIELD[provider].key]: credentialValue.trim() },
        quota_config,
      },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-lg transition-all">
          <Plus className="w-3 h-3" />
          Add Account
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add AI Account</DialogTitle>
          <DialogDescription>
            Adds a single account to the pool. Credentials are encrypted at rest and never shown
            again.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-label">Label</Label>
            <Input
              id="new-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="claude-3"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-provider">Provider</Label>
            <Select
              value={provider}
              onValueChange={(v) => {
                setProvider(v as AiAccountProvider);
                setCredentialValue('');
              }}
            >
              <SelectTrigger id="new-provider" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-credential">{CREDENTIAL_FIELD[provider].label}</Label>
            <Input
              id="new-credential"
              type={CREDENTIAL_FIELD[provider].masked ? 'password' : 'text'}
              value={credentialValue}
              onChange={(e) => setCredentialValue(e.target.value)}
              placeholder={provider === 'claude' ? 'ops@example.com' : 'sk-...'}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-quota">Quota config (JSON, optional)</Label>
            <Textarea
              id="new-quota"
              value={quotaText}
              onChange={(e) => setQuotaText(e.target.value)}
              placeholder='{"weekly_budget": 1000}'
              rows={3}
            />
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <DialogFooter>
            <button
              type="submit"
              disabled={createAccount.isPending}
              className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-lg transition-all disabled:opacity-50"
            >
              {createAccount.isPending ? 'Adding...' : 'Add Account'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EditAccountDialog = ({ account }: { account: AiAccount }) => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(account.label);
  const [credentialValue, setCredentialValue] = useState('');
  const [quotaText, setQuotaText] = useState(
    account.quota_config && typeof account.quota_config === 'object'
      ? JSON.stringify(account.quota_config, null, 2)
      : '',
  );
  const [error, setError] = useState<string | null>(null);
  const updateAccount = useUpdateAiAccount();
  const credField = CREDENTIAL_FIELD[account.provider];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setError('Label is required.');
      return;
    }
    const { value: quota_config, error: quotaError } = parseQuotaConfig(quotaText);
    if (quotaError) {
      setError(quotaError);
      return;
    }
    setError(null);
    updateAccount.mutate(
      {
        id: account.id,
        payload: {
          label: label.trim(),
          quota_config,
          ...(credentialValue.trim()
            ? { credentials: { [credField.key]: credentialValue.trim() } }
            : {}),
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          setCredentialValue('');
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          // Re-sync from the latest account props each time the dialog opens (they may have
          // changed since the last edit — e.g. another admin's edit, or a CSV re-import).
          setLabel(account.label);
          setQuotaText(
            account.quota_config && typeof account.quota_config === 'object'
              ? JSON.stringify(account.quota_config, null, 2)
              : '',
          );
          setCredentialValue('');
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          title="Edit"
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {account.label}</DialogTitle>
          <DialogDescription>
            {account.provider} / {account.runtime}. Leave the credential blank to keep it
            unchanged.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={`edit-label-${account.id}`}>Label</Label>
            <Input
              id={`edit-label-${account.id}`}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`edit-cred-${account.id}`}>{credField.label} (optional — replace)</Label>
            <Input
              id={`edit-cred-${account.id}`}
              type={credField.masked ? 'password' : 'text'}
              value={credentialValue}
              onChange={(e) => setCredentialValue(e.target.value)}
              placeholder="Leave blank to keep current credential"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`edit-quota-${account.id}`}>Quota config (JSON)</Label>
            <Textarea
              id={`edit-quota-${account.id}`}
              value={quotaText}
              onChange={(e) => setQuotaText(e.target.value)}
              rows={3}
            />
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <DialogFooter>
            <button
              type="submit"
              disabled={updateAccount.isPending}
              className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-lg transition-all disabled:opacity-50"
            >
              {updateAccount.isPending ? 'Saving...' : 'Save'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const DeleteAccountConfirm = ({ account }: { account: AiAccount }) => {
  const [open, setOpen] = useState(false);
  const deleteAccount = useDeleteAiAccount();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <button
        title="Remove"
        onClick={() => setOpen(true)}
        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {account.label}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the account and its usage history from the pool. Runs already
            using it are unaffected. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            disabled={deleteAccount.isPending}
            onClick={() =>
              deleteAccount.mutate(account.id, { onSuccess: () => setOpen(false) })
            }
          >
            {deleteAccount.isPending ? 'Removing...' : 'Remove'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
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
      <TableCell>
        <div className="flex items-center gap-1">
          <EditAccountDialog account={account} />
          <DeleteAccountConfirm account={account} />
        </div>
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
      title={cmd}
      className="flex items-center gap-1.5 max-w-[240px] min-w-0 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? (
        <Check className="w-3 h-3 shrink-0 text-green-500" />
      ) : (
        <Copy className="w-3 h-3 shrink-0" />
      )}
      <span className="truncate min-w-0">{cmd}</span>
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
                        className={`inline-block whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-bold ${badge.cls}`}
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

      <div className="mb-4 flex items-center gap-2">
        <AddAccountDialog />

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
          className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-lg transition-all disabled:opacity-50"
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
              <TableHead>Actions</TableHead>
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
