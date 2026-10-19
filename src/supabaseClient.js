import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iyztmegpytqjlqbjaufy.supabase.co';
const supabaseAnonKey = 'sb_publishable_isi9k71Ctd1HVLxmkDamVA_5JG_bChf';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
