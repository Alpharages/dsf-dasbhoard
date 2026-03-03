import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';

export interface IntegrationHealthResponse {
  docker: boolean;
  sendgrid: boolean;
  openai: boolean;
  slack: boolean;
}

export function useIntegrationHealth() {
  return useQuery<IntegrationHealthResponse>({
    queryKey: ['integration-health'],
    queryFn: async () => {
      const { data } = await apiClient.get('/health/integrations');
      return data;
    },
    refetchInterval: 30000, 
  });
}
