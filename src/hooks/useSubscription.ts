import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface ResourceUsage {
  services: number;
  staff: number;
  appointmentsThisMonth: number;
}

export function useSubscription(businessId: string) {
  const [usage, setUsage] = useState<ResourceUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchSubscriptionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch current usage
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [servicesResult, staffResult, appointmentsResult] = await Promise.all([
        // Count services
        supabase
          .from('services')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', businessId)
          .eq('active', true),

        // Count staff
        supabase
          .from('staff')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', businessId)
          .eq('is_active', true),

        // Count appointments this month
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', businessId)
          .gte('created_at', startOfMonth.toISOString()),
      ]);

      setUsage({
        services: servicesResult.count || 0,
        staff: staffResult.count || 0,
        appointmentsThisMonth: appointmentsResult.count || 0,
      });

    } catch (err: unknown) {
      const error = err as { message?: string; error_description?: string; code?: string; details?: string; hint?: string };
      const errorMessage = error?.message || error?.error_description || 'Error desconocido';
      console.error('Error fetching usage data:', {
        message: errorMessage,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        businessId
      });
      setError(`Error al cargar datos de uso: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      fetchSubscriptionData();
    }
  }, [businessId, fetchSubscriptionData]);

  const canAddResource = (_resourceType: keyof ResourceUsage): boolean => {
    // Sin límites por ahora - permitir todo
    return true;
  };

  return {
    usage,
    loading,
    error,
    canAddResource,
    refetch: fetchSubscriptionData,
  };
}