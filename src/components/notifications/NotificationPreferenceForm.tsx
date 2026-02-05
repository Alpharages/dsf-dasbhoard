import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessEventType } from '@/lib/auth/permissions';
import type { NotificationPreference, NotificationChannel, SeverityLevel } from '@/types/notifications';
import { 
  AVAILABLE_EVENT_TYPES, 
  AVAILABLE_CHANNELS,
  SEVERITY_LEVELS 
} from '@/types/notifications';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const preferenceSchema = z.object({
  eventType: z.string().min(1, 'Event type is required'),
  channels: z.array(z.string()).min(1, 'At least one channel is required'),
  enabled: z.boolean(),
  filters: z.object({
    projectIds: z.array(z.string()).optional(),
    severities: z.array(z.string()).optional(),
    providers: z.array(z.string()).optional(),
  }).optional(),
});

type PreferenceFormData = z.infer<typeof preferenceSchema>;

interface NotificationPreferenceFormProps {
  isOpen: boolean;
  onClose: () => void;
  preference?: NotificationPreference | null;
  onSubmit: (data: PreferenceFormData) => Promise<void>;
  availableProjects?: { id: string; name: string }[];
}

export function NotificationPreferenceForm({
  isOpen,
  onClose,
  preference,
  onSubmit,
  availableProjects = [],

}: NotificationPreferenceFormProps) {
  const { user } = useAuth();
  const isEditing = !!preference;

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PreferenceFormData>({
    resolver: zodResolver(preferenceSchema),
    defaultValues: preference ? {
      eventType: preference.eventType,
      channels: preference.channels,
      enabled: preference.enabled,
      filters: preference.filters || {},
    } : {
      eventType: '',
      channels: ['in_app'],
      enabled: true,
      filters: {},
    },
  });

  const selectedChannels = watch('channels') || [];
  const selectedSeverities = watch('filters.severities') || [];
  const selectedProjects = watch('filters.projectIds') || [];
  const enabled = watch('enabled');

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data: PreferenceFormData) => {
    try {
      await onSubmit(data);
      handleClose();
    } catch (error) {
      // Error handled by parent
    }
  };

  const toggleChannel = (channel: NotificationChannel) => {
    const current = selectedChannels;
    if (current.includes(channel)) {
      setValue('channels', current.filter(c => c !== channel));
    } else {
      setValue('channels', [...current, channel]);
    }
  };

  const toggleSeverity = (severity: SeverityLevel) => {
    const current = selectedSeverities;
    if (current.includes(severity)) {
      setValue('filters.severities', current.filter(s => s !== severity));
    } else {
      setValue('filters.severities', [...current, severity]);
    }
  };

  const toggleProject = (projectId: string) => {
    const current = selectedProjects;
    if (current.includes(projectId)) {
      setValue('filters.projectIds', current.filter(p => p !== projectId));
    } else {
      setValue('filters.projectIds', [...current, projectId]);
    }
  };

  // Filter available event types based on user role
  const filteredEventTypes = AVAILABLE_EVENT_TYPES.filter(
    et => canAccessEventType(user, et.value)
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-200">
            {isEditing ? 'Edit Notification Preference' : 'Create Notification Preference'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
          {/* Event Type */}
          <div className="space-y-2">
            <Label htmlFor="eventType">Event Type</Label>
            <Select
              value={watch('eventType')}
              onValueChange={(value) => setValue('eventType', value)}
              disabled={isEditing}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {filteredEventTypes.map((type) => (
                  <SelectItem 
                    key={type.value} 
                    value={type.value}
                    className="text-slate-200 focus:bg-slate-700 focus:text-slate-100"
                  >
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.eventType && (
              <p className="text-xs text-rose-400">{errors.eventType.message}</p>
            )}
          </div>

          {/* Channels */}
          <div className="space-y-2">
            <Label>Notification Channels</Label>
            <div className="flex flex-wrap gap-3">
              {AVAILABLE_CHANNELS.map((channel) => (
                <div
                  key={channel.value}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                    selectedChannels.includes(channel.value)
                      ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                  onClick={() => toggleChannel(channel.value)}
                >
                  <Checkbox
                    checked={selectedChannels.includes(channel.value)}
                    onCheckedChange={() => toggleChannel(channel.value)}
                  />
                  <span className="text-sm">{channel.label}</span>
                </div>
              ))}
            </div>
            {errors.channels && (
              <p className="text-xs text-rose-400">{errors.channels.message}</p>
            )}
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center justify-between py-3 border-t border-slate-800">
            <div>
              <Label htmlFor="enabled" className="cursor-pointer">Enable Notifications</Label>
              <p className="text-xs text-slate-500">
                {enabled ? 'You will receive notifications for this event' : 'Notifications are disabled'}
              </p>
            </div>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={(checked) => setValue('enabled', checked)}
            />
          </div>

          {/* Filters */}
          <div className="space-y-4 border-t border-slate-800 pt-4">
            <Label>Filters (Optional)</Label>
            <p className="text-xs text-slate-500">
              Only receive notifications matching these criteria
            </p>

            {/* Severity Filter */}
            <div className="space-y-2">
              <Label className="text-sm text-slate-400">Severity Levels</Label>
              <div className="flex flex-wrap gap-2">
                {SEVERITY_LEVELS.map((severity) => (
                  <Badge
                    key={severity.value}
                    variant={selectedSeverities.includes(severity.value) ? 'default' : 'outline'}
                    className={`cursor-pointer ${
                      selectedSeverities.includes(severity.value)
                        ? 'bg-slate-700 text-slate-200'
                        : 'border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                    onClick={() => toggleSeverity(severity.value)}
                  >
                    {severity.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Project Filter */}
            {availableProjects.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-slate-400">Projects</Label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {availableProjects.map((project) => (
                    <Badge
                      key={project.id}
                      variant={selectedProjects.includes(project.id) ? 'default' : 'outline'}
                      className={`cursor-pointer ${
                        selectedProjects.includes(project.id)
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : 'border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                      onClick={() => toggleProject(project.id)}
                    >
                      {project.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="border-t border-slate-800 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
