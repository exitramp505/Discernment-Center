const { createClient } = require('@supabase/supabase-js');

function json(statusCode, body) { return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }; }
function adminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok:false, error:'Method not allowed' });
  try {
    const body = JSON.parse(event.body || '{}');
    if (body.password !== process.env.ADMIN_PASSWORD) return json(401, { ok:false, error:'Incorrect admin password.' });
    const admin = adminClient();
    if (!admin) return json(500, { ok:false, error:'Supabase service role key is not configured.' });
    const kind = body.kind === 'resume' ? 'resume' : 'photo';
    const { data, error } = await admin.from('candidate_applications').select('photo_path,resume_path,photo_name,resume_name').eq('id', body.applicationId).maybeSingle();
    if (error) throw error;
    if (!data) return json(404, { ok:false, error:'Application not found.' });
    const path = kind === 'resume' ? data.resume_path : data.photo_path;
    if (!path) return json(404, { ok:false, error:'File not found.' });
    const signed = await admin.storage.from('candidate-uploads').createSignedUrl(path, 60 * 5, { download: true });
    if (signed.error) throw signed.error;
    return json(200, { ok:true, url:signed.data.signedUrl, name: kind === 'resume' ? data.resume_name : data.photo_name });
  } catch (error) {
    return json(500, { ok:false, error:error.message || 'Could not access file.' });
  }
};