import { ObservabilityControlPanel } from '@/features/observability';

const getToken = () =>
  localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

/**
 * Observability Page - Wrapper for the Observability Control Panel
 *
 * This page is accessible to operators, PMs, TLs, QAs, Managers, and Admins
 * per the API permissions defined in the backend.
 */
export function ObservabilityPage() {
  return (
    <ObservabilityControlPanel
      enableRealtime={true}
      pollingInterval={30000}
      token={getToken()}
    />
  );
}
