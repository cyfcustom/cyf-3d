import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { Button } from '@/app/components/ui/button';
import { authUserAtom } from '@/app/store/atoms';
import { sublimationConfigMetaAtom } from '@/app/store/calculator';
import { saveCalculation } from '@/app/lib/api/calculationHistoryApi';
import { toast } from 'sonner';
import { Save, Check } from 'lucide-react';
import type { Json } from '@/app/types/supabase';

interface Props {
  moduleName: string;
  totals: any;
  quantity: number;
  note?: string;
}

export function SaveCalculationButton({ moduleName, totals, quantity, note }: Props) {
  const authUser = useAtomValue(authUserAtom);
  const configMeta = useAtomValue(sublimationConfigMetaAtom);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!authUser) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveCalculation(
        authUser.id,
        moduleName,
        totals as Json,
        configMeta.configVersion,
        totals as Json,
        quantity,
        totals.total ?? 0,
        note
      );
      setSaved(true);
      toast.success('Cálculo guardado en historial');
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      toast.error('Error al guardar el cálculo');
      console.error('[SaveCalc]', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSave}
      disabled={isSaving || saved}
      className="gap-2"
    >
      {saved ? (
        <>
          <Check size={16} />
          Guardado
        </>
      ) : (
        <>
          <Save size={16} />
          {isSaving ? 'Guardando...' : 'Guardar Cálculo'}
        </>
      )}
    </Button>
  );
}
