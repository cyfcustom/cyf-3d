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
}

const DEFAULTS: CompanyInfo = {
  name: 'CYF Customs',
  slogan: 'Amor para ayudar',
  phone: '584124553107',
  email: 'contacto@cyfcustoms.com',
  instagram_url: 'https://instagram.com/cyfcustoms',
  facebook_url: 'https://facebook.com/cyfcustoms',
  whatsapp_message_template: '¡Hola CYF Customs! 👋',
  address: 'Mérida, Venezuela',
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
          cached = data as CompanyInfo;
          setInfo(cached);
        }
        setLoading(false);
      });
  }, []);

  return { info, loading };
}
