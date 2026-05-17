const { getStore } = require('@netlify/blobs');
const { createClient } = require('@supabase/supabase-js');

function getAssessmentStore() {
  const name = 'discernment-assessments';
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN;
  if (siteID && token) return getStore({ name, siteID, token });
  return getStore(name);
}
function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });
  try {
    const body = JSON.parse(event.body || '{}');
    const password = body.password || '';
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) return json(500, { ok: false, error: 'Admin dashboard is not configured. Add ADMIN_PASSWORD in Netlify environment variables.' });
    if (password !== adminPassword) return json(401, { ok: false, error: 'Incorrect admin password.' });

    const admin = getSupabaseAdmin();
    if (admin) {
      if (body.id) {
        const { data, error } = await admin.from('assessment_results').select('*').eq('id', body.id).maybeSingle();
        if (error) throw error;
        if (!data) return json(404, { ok: false, error: 'Submission not found.' });
        return json(200, { ok: true, submission: recordFromSupabase(data) });
      }
      const { data, error } = await admin.from('assessment_results').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      let applications = [];
      const appResult = await admin.from('candidate_applications').select('*').order('updated_at', { ascending: false });
      if (!appResult.error) applications = (appResult.data || []).map(applicationSummary);

      return json(200, { ok: true, submissions: (data || []).map(summaryFromSupabase), applications, source: 'supabase' });
    }

    const store = getAssessmentStore();
    if (body.id) {
      const record = await store.get(`${body.id}.json`, { type: 'json' });
      if (!record) return json(404, { ok: false, error: 'Submission not found.' });
      return json(200, { ok: true, submission: record });
    }
    const list = await store.list();
    const blobs = list.blobs || [];
    const submissions = [];
    for (const blob of blobs) {
      if (!blob.key || !blob.key.endsWith('.json')) continue;
      try { const record = await store.get(blob.key, { type: 'json' }); if (record) submissions.push(summary(record)); } catch (_) {}
    }
    submissions.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
    return json(200, { ok: true, submissions, applications: [], source: 'blobs' });
  } catch (error) {
    return json(500, { ok: false, error: error.message || 'Unexpected admin dashboard error.' });
  }
};

function applicationSummary(row) {
  const app = row.application || {};
  return {
    id: row.id,
    userId: row.user_id,
    name: row.candidate_name || app.fullName || '',
    email: row.email || app.email || '',
    phone: row.phone || app.phone || '',
    state: row.state || app.state || '',
    region: row.region || app.region || '',
    status: row.status || 'draft',
    completion: row.completion ?? 0,
    updatedAt: row.updated_at,
    submittedAt: row.submitted_at,
    application: app,
    photoName: row.photo_name || '',
    resumeName: row.resume_name || '',
    hasPhoto: Boolean(row.photo_path),
    hasResume: Boolean(row.resume_path)
  };
}
function summaryFromSupabase(row) {
  const c = row.candidate || {};
  const s = row.scores || {};
  return {
    id: row.id,
    userId: row.user_id,
    submittedAt: row.created_at,
    name: c.name || c.full_name || '',
    email: c.email || '',
    phone: c.phone || '',
    state: row.state || c.state || '',
    married: c.married || '',
    overall: row.overall ?? s.overall ?? '',
    overallLabel: row.overall_label || s.overallLabel || '',
    top: s.top || [],
    growth: s.growth || [],
    routedLeader: row.routed_leader || '',
    emailSent: Boolean(row.email_sent),
    emailError: row.email_error || '',
    assessmentType: s.assessmentType || '',
    assessmentTitle: s.assessmentTitle || ''
  };
}
function recordFromSupabase(row) {
  return {
    id: row.id,
    submittedAt: row.created_at,
    routedLeader: row.routed_leader || '',
    emailSent: Boolean(row.email_sent),
    emailError: row.email_error || '',
    candidate: row.candidate || {},
    scores: row.scores || {},
    answers: row.answers || {}
  };
}
function summary(record) {
  const c = record.candidate || {};
  const s = record.scores || {};
  return { id: record.id, submittedAt: record.submittedAt, name: c.name || '', email: c.email || '', phone: c.phone || '', state: c.state || '', married: c.married || '', overall: s.overall ?? '', overallLabel: s.overallLabel || '', top: s.top || [], growth: s.growth || [], routedLeader: record.routedLeader || '', emailSent: Boolean(record.emailSent), emailError: record.emailError || '', assessmentType: s.assessmentType || '', assessmentTitle: s.assessmentTitle || '' };
}
function json(statusCode, body) { return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }; }