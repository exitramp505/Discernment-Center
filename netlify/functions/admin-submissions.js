const { getStore } = require('@netlify/blobs');

function getAssessmentStore() {
  const name = 'discernment-assessments';
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN;

  if (siteID && token) {
    return getStore({ name, siteID, token });
  }

  return getStore(name);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, error: 'Method not allowed' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const password = body.password || '';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return json(500, { ok: false, error: 'Admin dashboard is not configured. Add ADMIN_PASSWORD in Netlify environment variables.' });
    }

    if (password !== adminPassword) {
      return json(401, { ok: false, error: 'Incorrect admin password.' });
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
      try {
        const record = await store.get(blob.key, { type: 'json' });
        if (!record) continue;
        submissions.push(summary(record));
      } catch (_) {
        // Skip malformed records instead of breaking the dashboard.
      }
    }

    submissions.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));

    return json(200, { ok: true, submissions });
  } catch (error) {
    return json(500, { ok: false, error: error.message || 'Unexpected admin dashboard error.' });
  }
};

function summary(record) {
  const c = record.candidate || {};
  const s = record.scores || {};
  return {
    id: record.id,
    submittedAt: record.submittedAt,
    name: c.name || '',
    email: c.email || '',
    phone: c.phone || '',
    state: c.state || '',
    married: c.married || '',
    overall: s.overall ?? '',
    overallLabel: s.overallLabel || '',
    top: s.top || [],
    growth: s.growth || [],
    routedLeader: record.routedLeader || '',
    emailSent: Boolean(record.emailSent),
    emailError: record.emailError || ''
  };
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}
