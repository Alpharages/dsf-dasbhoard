import { ObservabilityControlPanel } from '@/features/observability';
import { useAuth } from '@/contexts';

/**
 * Observability Page - Wrapper for the Observability Control Panel
 * 
 * This page is accessible to operators, PMs, TLs, QAs, Managers, and Admins
 * per the API permissions defined in the backend.
 */
export function ObservabilityPage() {
  const { token } = useAuth();

  return (
    <ObservabilityControlPanel
      enableRealtime={true}
      pollingInterval={30000}
      token={token}
    />
  );
}
