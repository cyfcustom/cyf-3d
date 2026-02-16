import { supabase } from '@/app/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function subscribeToConfigChanges(
  moduleName: string,
  callback: (payload: any) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`config-changes-${moduleName}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'calculator_configs',
        filter: `module_name=eq.${moduleName}`,
      },
      (payload) => {
        console.log(`[Realtime] Config updated for ${moduleName}:`, payload);
        callback(payload.new);
      }
    )
    .subscribe();

  return channel;
}

export function unsubscribeFromChannel(channel: RealtimeChannel) {
  supabase.removeChannel(channel);
}
