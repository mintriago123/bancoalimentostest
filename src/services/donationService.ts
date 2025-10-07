import type { SupabaseClient } from '@supabase/supabase-js';

export type DonationPayload = Record<string, any>;

export async function createDonation(supabase: SupabaseClient, payload: DonationPayload) {
  const { error } = await supabase.from('donaciones').insert([payload]);
  if (error) throw error;
  return true;
}
