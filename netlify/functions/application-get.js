const { createClient } = require('@supabase/supabase-js');

function json(statusCode, body) { return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }; }
function adminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
async function userFromEvent(event) {
  const h = event.headers.authorization || event.headers.Authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) return null;
  const admin = adminClient();
  if (!admin) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { ok:false, error:'Method not allowed' });
  try {
    const user = await userFromEvent(event);
    if (!user) return json(401, { ok:false, error:'You must be logged in.' });
    const admin = adminClient();
    if (!admin) return json(500, { ok:false, error:'Supabase service role key is not configured.' });
    const { data, error } = await admin.from('candidate_applications').select('*').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    return json(200, { ok:true, application: data || null });
  } catch (error) {
    return json(500, { ok:false, error:error.message || 'Could not load application.' });
  }
};