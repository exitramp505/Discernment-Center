const { createClient } = require('@supabase/supabase-js');

const STATE_REGIONS={WA:'Pacific',HI:'Pacific',AK:'Pacific',AZ:'Pacific',UT:'Pacific',CA:'Pacific',NV:'Pacific',ID:'Pacific',OR:'Pacific',TX:'Central',OK:'Central',AR:'Central',WI:'Central',MN:'Central',IA:'Central',IL:'Central',MO:'Central',KS:'Central',CO:'Mountain Plains',WY:'Mountain Plains',NE:'Mountain Plains',SD:'Mountain Plains',ND:'Mountain Plains',MT:'Mountain Plains',NH:'East',VT:'East',MA:'East',ME:'East',RI:'East',CT:'East',NJ:'East',DE:'East',MD:'East',WV:'East',PA:'East',OH:'East',VA:'East',KY:'East',TN:'East',IN:'East',MI:'East',NY:'East',FL:'South East',GA:'South East',AL:'South East',MS:'South East',LA:'South East',SC:'South East',NC:'South East',PR:'South East'};
function json(statusCode, body) { return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }; }
function safeName(v){ return String(v||'file').toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80) || 'file'; }
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
function dataUrlToBuffer(dataUrl){
  const match=String(dataUrl||'').match(/^data:([^;]+);base64,(.+)$/);
  if(!match) throw new Error('Invalid file data.');
  return { mimeType: match[1], buffer: Buffer.from(match[2], 'base64') };
}
function completionPercent(app){
  const keys=['fullName','email','phone','state','address','maritalStatus','conversionStory','callToMinistry','hasSponsor','licenseStatus','lastYearIncome','averageIncome','bankruptcy','whyPlant','plantType','targetAudience','financialPlan','plantTiming','supportNetwork','waiverAgreement','statementOfFaith','coreConvictions'];
  const done=keys.filter(k=>{const v=app[k]; return Array.isArray(v)?v.length:String(v||'').trim();}).length;
  return Math.round((done/keys.length)*100);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok:false, error:'Method not allowed' });
  try {
    const user = await userFromEvent(event);
    if (!user) return json(401, { ok:false, error:'You must be logged in to save the application.' });
    const admin = adminClient();
    if (!admin) return json(500, { ok:false, error:'Supabase service role key is not configured.' });

    const body = JSON.parse(event.body || '{}');
    const application = body.application || {};
    const status = body.status === 'submitted' ? 'submitted' : 'draft';
    const files = Array.isArray(body.files) ? body.files : [];
    const state = application.state || '';
    const region = application.region || STATE_REGIONS[state] || '';
    const completion = completionPercent(application);
    const now = new Date().toISOString();

    let photo_path = null, photo_name = null, resume_path = null, resume_name = null;

    for (const file of files) {
      if (!['photo','resume'].includes(file.kind)) continue;
      const parsed = dataUrlToBuffer(file.dataUrl);
      const original = safeName(file.fileName);
      const path = `${user.id}/${file.kind}-${Date.now()}-${original}`;
      const { error: uploadError } = await admin.storage.from('candidate-uploads').upload(path, parsed.buffer, {
        contentType: file.mimeType || parsed.mimeType || 'application/octet-stream',
        upsert: true
      });
      if (uploadError) throw uploadError;
      if (file.kind === 'photo') { photo_path = path; photo_name = file.fileName || original; }
      if (file.kind === 'resume') { resume_path = path; resume_name = file.fileName || original; }
    }

    const existing = await admin.from('candidate_applications').select('photo_path,photo_name,resume_path,resume_name').eq('user_id', user.id).maybeSingle();
    const existingRow = existing.data || {};

    const row = {
      user_id: user.id,
      candidate_name: application.fullName || '',
      email: application.email || user.email || '',
      phone: application.phone || '',
      state,
      region,
      status,
      completion,
      application,
      photo_path: photo_path || existingRow.photo_path || null,
      photo_name: photo_name || existingRow.photo_name || null,
      resume_path: resume_path || existingRow.resume_path || null,
      resume_name: resume_name || existingRow.resume_name || null,
      submitted_at: status === 'submitted' ? now : null,
      updated_at: now
    };

    const { data, error } = await admin.from('candidate_applications').upsert(row, { onConflict:'user_id' }).select('*').single();
    if (error) throw error;

    await admin.from('candidate_profiles').upsert({
      id: user.id,
      full_name: application.fullName || '',
      email: application.email || user.email || '',
      phone: application.phone || '',
      state,
      region,
      married: application.maritalStatus === 'Married' ? 'Yes' : 'No',
      updated_at: now
    }, { onConflict:'id' });

    return json(200, { ok:true, application:data, photoName:data.photo_name, resumeName:data.resume_name });
  } catch (error) {
    return json(500, { ok:false, error:error.message || 'Could not save application.' });
  }
};