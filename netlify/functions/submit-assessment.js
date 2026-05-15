const { Resend } = require('resend');
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

const DEFAULT_STATE_LEADERS = {
  OH: 'leader-oh@example.com',
  MI: 'leader-mi@example.com',
  PA: 'leader-pa@example.com',
  NY: 'leader-ny@example.com'
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, error: 'Method not allowed' });
  }

  let savedRecord = null;

  try {
    const data = JSON.parse(event.body || '{}');
    const candidate = data.candidate || {};
    const scores = data.scores || {};

    if (!candidate.name || !candidate.email || !candidate.state || !scores.results) {
      return json(400, { ok: false, error: 'Missing required report data.' });
    }

    const stateLeaders = getStateLeaders();
    const adminEmail = process.env.ADMIN_EMAIL;
    const leaderEmail = stateLeaders[candidate.state] || process.env.DEFAULT_LEADER_EMAIL || adminEmail;

    savedRecord = await saveSubmission(data, leaderEmail);

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;

    if (!apiKey || !fromEmail || !adminEmail) {
      return json(500, {
        ok: false,
        stored: true,
        submissionId: savedRecord.id,
        error: 'The report was stored, but email is not configured. Add RESEND_API_KEY, FROM_EMAIL, and ADMIN_EMAIL in Netlify environment variables.'
      });
    }

    const recipients = uniqueEmails([
      adminEmail,
      candidate.email,
      leaderEmail
    ]);

    const subject = `Discernment Assessment Report - ${candidate.name}`;
    const html = buildHtmlReport(data, leaderEmail, savedRecord.id);
    const text = buildTextReport(data, leaderEmail, savedRecord.id);

    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      subject,
      html,
      text,
      reply_to: adminEmail
    });

    if (result.error) {
      await updateEmailStatus(savedRecord.key, {
        emailSent: false,
        emailError: result.error.message || 'Resend could not send the email.'
      });
      return json(500, {
        ok: false,
        stored: true,
        submissionId: savedRecord.id,
        error: result.error.message || 'Resend could not send the email.'
      });
    }

    await updateEmailStatus(savedRecord.key, {
      emailSent: true,
      messageId: result.data && result.data.id ? result.data.id : null,
      sentTo: recipients
    });

    return json(200, {
      ok: true,
      stored: true,
      emailSent: true,
      submissionId: savedRecord.id,
      sentTo: recipients,
      routedLeader: leaderEmail,
      messageId: result.data && result.data.id ? result.data.id : null
    });
  } catch (error) {
    return json(500, {
      ok: false,
      stored: Boolean(savedRecord),
      submissionId: savedRecord ? savedRecord.id : null,
      error: error.message || 'Unexpected server error.'
    });
  }
};

async function saveSubmission(data, leaderEmail) {
  const store = getAssessmentStore();
  const now = new Date();
  const candidate = data.candidate || {};
  const id = `${now.toISOString().replace(/[:.]/g, '-')}-${slug(candidate.name || 'candidate')}`;
  const key = `${id}.json`;
  const record = {
    id,
    submittedAt: now.toISOString(),
    routedLeader: leaderEmail || '',
    emailSent: false,
    candidate,
    scores: data.scores || {},
    reflections: data.reflections || {},
    answers: data.answers || {}
  };
  await store.setJSON(key, record);
  return { id, key };
}

async function updateEmailStatus(key, updates) {
  try {
    const store = getAssessmentStore();
    const existing = await store.get(key, { type: 'json' });
    if (!existing) return;
    await store.setJSON(key, { ...existing, ...updates, emailUpdatedAt: new Date().toISOString() });
  } catch (_) {
    // Do not fail the user flow if the status update fails.
  }
}

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'candidate';
}

function getStateLeaders() {
  if (!process.env.STATE_LEADER_EMAILS_JSON) return DEFAULT_STATE_LEADERS;
  try {
    return { ...DEFAULT_STATE_LEADERS, ...JSON.parse(process.env.STATE_LEADER_EMAILS_JSON) };
  } catch (_) {
    return DEFAULT_STATE_LEADERS;
  }
}

function uniqueEmails(emails) {
  return [...new Set((emails || []).filter(Boolean).map(e => String(e).trim()).filter(e => e.includes('@')))];
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildHtmlReport(data, leaderEmail, submissionId) {
  const c = data.candidate || {};
  const s = data.scores || {};
  const results = s.results || [];
  const top = s.top || [];
  const growth = s.growth || [];
  const r = data.reflections || {};

  const rows = results.map(item => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.name)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;">${escapeHtml(item.score ?? 'N/A')}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.label)}</td>
    </tr>`).join('');

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.5;max-width:760px;margin:0 auto;">
    <h1 style="font-size:24px;margin-bottom:4px;">Discernment Center Candidate Assessment Report</h1>
    <p style="color:#4b5563;margin-top:0;">Generated ${escapeHtml(new Date().toLocaleString())}</p>

    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:16px;margin:18px 0;">
      <p><strong>Submission ID:</strong> ${escapeHtml(submissionId || '')}</p>
      <p><strong>Candidate:</strong> ${escapeHtml(c.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(c.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(c.phone)}</p>
      <p><strong>State:</strong> ${escapeHtml(c.state)}</p>
      <p><strong>Married:</strong> ${escapeHtml(c.married)}</p>
      <p><strong>Routed Regional Leader Email:</strong> ${escapeHtml(leaderEmail)}</p>
    </div>

    <h2 style="font-size:20px;">Overall Readiness</h2>
    <p style="font-size:18px;"><strong>${escapeHtml(s.overall)} out of 5</strong> — ${escapeHtml(s.overallLabel)}</p>

    <h2 style="font-size:20px;">Category Scores</h2>
    <table style="border-collapse:collapse;width:100%;border:1px solid #e5e7eb;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th align="left" style="padding:9px 10px;">Character Quality</th>
          <th align="center" style="padding:9px 10px;">Score</th>
          <th align="left" style="padding:9px 10px;">Interpretation</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <h2 style="font-size:20px;">Strongest Areas</h2>
    <ol>${top.map(item => `<li>${escapeHtml(item.name)}: ${escapeHtml(item.score)}</li>`).join('')}</ol>

    <h2 style="font-size:20px;">Primary Growth Areas</h2>
    <ol>${growth.map(item => `<li>${escapeHtml(item.name)}: ${escapeHtml(item.score)}</li>`).join('')}</ol>

    <h2 style="font-size:20px;">Reflection Responses</h2>
    <p><strong>Strengths:</strong><br>${escapeHtml(r.strengths || c.strengths || '')}</p>
    <p><strong>Development Areas:</strong><br>${escapeHtml(r.growth || c.growth || '')}</p>
    <p><strong>Concerns or Questions:</strong><br>${escapeHtml(r.concerns || c.concerns || '')}</p>
    <p><strong>Other:</strong><br>${escapeHtml(r.other || c.other || '')}</p>

    <p style="color:#6b7280;font-size:13px;margin-top:24px;">This report is a discernment tool and should be reviewed alongside interviews, coach observations, and the broader Discernment Center process.</p>
  </div>`;
}

function buildTextReport(data, leaderEmail, submissionId) {
  const c = data.candidate || {};
  const s = data.scores || {};
  const r = data.reflections || {};
  return `Discernment Center Candidate Assessment Report

Submission ID: ${submissionId || ''}
Candidate: ${c.name || ''}
Email: ${c.email || ''}
Phone: ${c.phone || ''}
State: ${c.state || ''}
Married: ${c.married || ''}
Routed Regional Leader Email: ${leaderEmail || ''}

Overall Readiness: ${s.overall || ''} out of 5 - ${s.overallLabel || ''}

Category Scores:
${(s.results || []).map(item => `${item.name}: ${item.score ?? 'N/A'} - ${item.label}`).join('\n')}

Strongest Areas:
${(s.top || []).map(item => `${item.name}: ${item.score}`).join('\n')}

Primary Growth Areas:
${(s.growth || []).map(item => `${item.name}: ${item.score}`).join('\n')}

Reflection Responses:
Strengths: ${r.strengths || c.strengths || ''}
Development Areas: ${r.growth || c.growth || ''}
Concerns or Questions: ${r.concerns || c.concerns || ''}
Other: ${r.other || c.other || ''}

This report is a discernment tool and should be reviewed alongside interviews, coach observations, and the broader Discernment Center process.`;
}
