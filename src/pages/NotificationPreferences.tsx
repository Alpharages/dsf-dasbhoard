import { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2,
  Mail,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessEventType } from '@/lib/auth/permissions';
import { 
  useNotificationPreferences,
  useCreateNotificationPreference,
  useUpdateNotificationPreference,
  useDeleteNotificationPreference,
} from '@/hooks/queries/useNotifications';
import { NotificationPreferenceForm } from '@/components/notifications/NotificationPreferenceForm';
import type { 
  NotificationPreference, 
  CreatePreferenceRequest,
  UpdatePreferenceRequest 
} from '@/types/notifications';
import { AVAILABLE_EVENT_TYPES, AVAILABLE_CHANNELS } from '@/types/notifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  'slack': <MessageSquare className="w-4 h-4" />,
  'email': <Mail className="w-4 h-4" />,
  'in_app': <Bell className="w-4 h-4" />,
};

export function NotificationPreferences() {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPreference, setEditingPreference] = useState<NotificationPreference | null>(null);
  const [deletingPreference, setDeletingPreference] = useState<NotificationPreference | null>(null);

  // Fetch preferences
  const { data: preferences = [], isLoading, error } = useNotificationPreferences();

  // Mutations
  const createPreference = useCreateNotificationPreference();
  const updatePreference = useUpdateNotificationPreference();
  const deletePreference = useDeleteNotificationPreference();

  // Handle create
  const handleCreate = async (data: CreatePreferenceRequest) => {
    await createPreference.mutateAsync(data);
  };

  // Handle update
  const handleUpdate = async (data: UpdatePreferenceRequest) => {
    if (!editingPreference) return;
    await updatePreference.mutateAsync({ 
      preferenceId: editingPreference.id, 
      data 
    });
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingPreference) return;
    await deletePreference.mutateAsync(deletingPreference.id);
    setDeletingPreference(null);
  };

  // Open form for editing
  const openEditForm = (preference: NotificationPreference) => {
    setEditingPreference(preference);
    setIsFormOpen(true);
  };

  // Open form for creating
  const openCreateForm = () => {
    setEditingPreference(null);
    setIsFormOpen(true);
  };

  // Close form
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPreference(null);
  };

  // Get event type label
  const getEventTypeLabel = (value: string): string => {
    return AVAILABLE_EVENT_TYPES.find(et => et.value === value)?.label || value;
  };

  // Get channel label
  const getChannelLabel = (value: string): string => {
    return AVAILABLE_CHANNELS.find(c => c.value === value)?.label || value;
  };



  // Filter preferences based on user role — guard ensures filter only runs when
  // both user and preferences are fully loaded to prevent crashes on initial load
  const filteredPreferences = !isLoading && user
    ? preferences.filter(p => canAccessEventType(user, p.eventType))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notification Preferences</h1>
          <p className="text-muted-foreground mt-1">
            Configure how and when you receive notifications
          </p>
        </div>

        <Button
          onClick={openCreateForm}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Preference
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-lg text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-rose-400 mb-2">
            Failed to load preferences
          </h3>
          <p className="text-sm text-rose-400/70">{error.message}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredPreferences.length === 0 && (
        <div className="text-center py-20 bg-card/20 border border-dashed border-border rounded-lg">
          <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">
            No notification preferences
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            You haven&apos;t configured any notification preferences yet. 
            Create one to start receiving notifications.
          </p>
          <Button onClick={openCreateForm} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Preference
          </Button>
        </div>
      )}

      {/* Preferences Table */}
      {!isLoading && !error && filteredPreferences.length > 0 && (
        <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Event Type</TableHead>
                <TableHead className="text-muted-foreground">Channels</TableHead>
                <TableHead className="text-muted-foreground">Filters</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPreferences.map((preference) => (
                <TableRow 
                  key={preference.id}
                  className="border-border hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="font-medium text-foreground">
                      {getEventTypeLabel(preference.eventType)}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {preference.eventType}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex gap-2">
                      {preference.channels.map((channel) => (
                        <Badge
                          key={channel}
                          variant="outline"
                          className="border-border text-muted-foreground"
                        >
                          {CHANNEL_ICONS[channel]}
                          <span className="ml-1">{getChannelLabel(channel)}</span>
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {preference.filters?.severities && preference.filters.severities.length > 0 && (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                          {preference.filters.severities.length} severities
                        </Badge>
                      )}
                      {preference.filters?.projectIds && preference.filters.projectIds.length > 0 && (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                          {preference.filters.projectIds.length} projects
                        </Badge>
                      )}
                      {(!preference.filters?.severities?.length && !preference.filters?.projectIds?.length) && (
                        <span className="text-muted-foreground text-sm">No filters</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={preference.enabled}
                        onCheckedChange={(checked) => 
                          updatePreference.mutate({
                            preferenceId: preference.id,
                            data: { enabled: checked }
                          })
                        }
                        disabled={updatePreference.isPending}
                      />
                      <span className={`text-sm ${preference.enabled ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                        {preference.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditForm(preference)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingPreference(preference)}
                        className="text-muted-foreground hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Form Modal */}
      <NotificationPreferenceForm
        isOpen={isFormOpen}
        onClose={closeForm}
        preference={editingPreference}
        onSubmit={async (data) => {
          if (editingPreference) {
            await handleUpdate(data as UpdatePreferenceRequest);
          } else {
            await handleCreate(data as CreatePreferenceRequest);
          }
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog 
        open={!!deletingPreference} 
        onOpenChange={() => setDeletingPreference(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Notification Preference
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this notification preference? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deletingPreference && (
            <div className="py-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-foreground">
                  <span className="text-muted-foreground">Event:</span>{' '}
                  {getEventTypeLabel(deletingPreference.eventType)}
                </p>
                <p className="text-sm text-foreground">
                  <span className="text-muted-foreground">Channels:</span>{' '}
                  {deletingPreference.channels.map(getChannelLabel).join(', ')}
                </p>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeletingPreference(null)}
              className="bg-muted border-border text-foreground hover:bg-muted"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletePreference.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deletePreference.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
