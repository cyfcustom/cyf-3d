import { useEffect, useRef, ReactNode } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { isAuthenticatedAtom, authUserAtom } from '@/app/store/atoms';
import {
  sublimacionConfigMetaAtom,
  hydrateSublimacionFromSupabaseAtom,
} from '@/app/store/calculator/atoms';
import { subscribeToConfigChanges, unsubscribeFromChannel } from '@/app/lib/api/realtimeSubscriptions';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface CalculatorConfigProviderProps {
  children: ReactNode;
}

export function CalculatorConfigProvider({ children }: CalculatorConfigProviderProps) {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const authUser = useAtomValue(authUserAtom);
  const hydrateSublimacion = useSetAtom(hydrateSublimacionFromSupabaseAtom);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !authUser) return;

    // Hydrate sublimación config from Supabase on mount
    hydrateSublimacion();

    // Subscribe to realtime changes
    channelRef.current = subscribeToConfigChanges('sublimacion', () => {
      // Re-hydrate when admin updates config
      hydrateSublimacion();
    });

    return () => {
      if (channelRef.current) {
        unsubscribeFromChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isAuthenticated, authUser?.id]);

  return <>{children}</>;
}
