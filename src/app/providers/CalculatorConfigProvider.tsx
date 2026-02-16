import { useEffect, useRef, ReactNode } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { isAuthenticatedAtom, authUserAtom } from '@/app/store/atoms';
import {
  sublimationConfigMetaAtom,
  hydrateSublimationFromSupabaseAtom,
} from '@/app/store/calculator/atoms';
import { subscribeToConfigChanges, unsubscribeFromChannel } from '@/app/lib/api/realtimeSubscriptions';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface CalculatorConfigProviderProps {
  children: ReactNode;
}

export function CalculatorConfigProvider({ children }: CalculatorConfigProviderProps) {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const authUser = useAtomValue(authUserAtom);
  const hydrateSublimation = useSetAtom(hydrateSublimationFromSupabaseAtom);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !authUser) return;

    // Hydrate sublimation config from Supabase on mount
    hydrateSublimation();

    // Subscribe to realtime changes
    channelRef.current = subscribeToConfigChanges('sublimation', () => {
      // Re-hydrate when admin updates config
      hydrateSublimation();
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
