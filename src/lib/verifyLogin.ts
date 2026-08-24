import type { Official } from '@/types/official';
import { supabase } from '@/lib/supabase';
import { verifyDemoLogin } from '@/lib/demoOfficials';

type LoginResult =
  | { ok: true; official: Official }
  | { ok: false; reason: 'invalid' | 'unavailable' };

function isMissingRpcError(message: string): boolean {
  return message.includes('verify_official_login') || message.includes('PGRST202');
}

export async function verifyOfficialLogin(
  role: 'police' | 'court',
  identifier: string,
  password: string,
): Promise<LoginResult> {
  const { data, error } = await supabase.rpc('verify_official_login', {
    p_role: role,
    p_identifier: identifier.trim(),
    p_password: password,
  });

  if (error) {
    if (isMissingRpcError(error.message)) {
      const demo = verifyDemoLogin(role, identifier, password);
      return demo ? { ok: true, official: demo } : { ok: false, reason: 'invalid' };
    }
    return { ok: false, reason: 'unavailable' };
  }

  if (!data || data.length === 0) {
    return { ok: false, reason: 'invalid' };
  }

  const match = data[0];
  return {
    ok: true,
    official: {
      id: match.id,
      role: match.role,
      identifier: match.identifier,
      fullName: match.full_name,
    },
  };
}
