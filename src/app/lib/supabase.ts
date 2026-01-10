import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = 'https://jushzjpeetegcjyikclb.supabase.co';
const supabaseAnonKey = 'sb_publishable_7_NNj-RmsdvNH-K7QnX5Lg_-mMbrh3R';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
