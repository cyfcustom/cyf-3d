import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

export interface CompanyInfo {
  name: string;
  slogan: string;
  phone: string;
  email: string;
  instagram_url: string;
  facebook_url: string;
  whatsapp_message_template: string;
  address: string;
  // UX-2: payment info fields
  zelle_email: string;
  bank_rif: string;
}

const DEFAULTS: CompanyInfo = {
  name: 'CYF Custom',
  slogan: 'Amor para ayudar',
  phone: '584124553107',
  email: 'contacto@cyfcustoms.com',
  instagram_url: 'https://instagram.com/cyfcustoms',
  facebook_url: 'https://facebook.com/cyfcustoms',
  whatsapp_message_template: '¡Hola CYF Custom! 👋',
  address: 'Mérida, Venezuela',
  zelle_email: 'pagos@cyfcustoms.com',
  bank_rif: 'J-000000000',
};

let cached: CompanyInfo | null = null;

export function useCompanyInfo() {
  const [info, setInfo] = useState<CompanyInfo>(cached ?? DEFAULTS);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached) return;

    supabase
      .from('company_info')
      .select('*')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          // UX-2: merge with DEFAULTS so missing DB columns fall back gracefully
          cached = { ...DEFAULTS, ...(data as Partial<CompanyInfo>) } as CompanyInfo;
          setInfo(cached);
        }
        setLoading(false);
      });
  }, []);

  return { info, loading };
}
