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


const QUALITY_DEFINITIONS = {
  "Resilience": "Resilience reflects the candidate’s capacity to keep moving faithfully when ministry becomes difficult. It includes emotional steadiness under pressure, the ability to recover after disappointment or criticism, and the maturity to learn from setbacks without becoming defeated, reactive, or withdrawn.",
  "Spousal Cooperation": "For married candidates, Spousal Cooperation reflects the health of shared calling and family alignment. It looks at whether ministry expectations are openly discussed, whether roles and boundaries are clear, and whether the couple can protect family life while serving together through the demands of ministry.",
  "Financial Responsibility": "Financial Responsibility reflects the candidate’s stewardship, discipline, and credibility with resources. It includes managing personal finances wisely, avoiding unnecessary financial pressure, living within realistic limits, and demonstrating the trustworthiness needed to handle church or ministry funds with integrity.",
  "Builds Group Cohesiveness": "Builds Group Cohesiveness reflects the ability to gather people into a unified ministry community. It includes helping newcomers belong, keeping a group focused on mission, building morale, encouraging collaboration, and addressing conflict in ways that preserve trust and move people forward together.",
  "Effectively Builds Relationships": "Effectively Builds Relationships reflects the candidate’s ability to form genuine, trust-building connections with people. It includes taking initiative relationally, listening well, responding to needs with compassion, helping others feel safe and valued, and relating wisely across different personalities and backgrounds.",
  "Flexible and Adaptable": "Flexible and Adaptable reflects the candidate’s ability to adjust without losing mission clarity. It includes handling ambiguity, changing methods when circumstances require it, responding creatively to challenges, and adapting leadership priorities through different seasons of ministry growth and pressure.",
  "Exercises Faith": "Exercises Faith reflects a pattern of leadership rooted in dependence on God rather than anxiety, control, or self-reliance. It includes conviction about calling, prayerful decision-making, expectancy that God is at work, willingness to obey before outcomes are guaranteed, and patience to wait on God’s timing.",
  "Cultural Agility": "Cultural Agility reflects the candidate’s ability to understand and serve people whose background, assumptions, or lived experience differ from their own. It includes humility, curiosity, cultural awareness, and the ability to adapt communication and ministry approaches to the actual people being reached.",
  "Visionizing Capacity": "Visionizing Capacity reflects the ability to see and communicate a compelling ministry future. It includes forming a clear picture of what God may be building, translating vision into practical next steps, helping others see beyond present limitations, and treating challenges as opportunities rather than dead ends.",
  "Utilizes Giftedness of Others": "Utilizes Giftedness of Others reflects the candidate’s ability to recognize, develop, and release the gifts of people around them. It includes matching people to meaningful opportunities, delegating wisely, equipping before assigning responsibility, and building ministry that does not depend entirely on one leader.",
  "Relates to the Lost and Unchurched": "Relates to the Lost and Unchurched reflects the candidate’s ability to build authentic connection with people outside the church. It includes communicating faith naturally, understanding questions and barriers unchurched people carry, creating welcoming pathways, and moving toward spiritually curious or disconnected people with confidence and care.",
  "Responsive to Community": "Responsive to Community reflects the candidate’s attentiveness to the real life, needs, culture, and pulse of the surrounding community. It includes listening before acting, identifying practical ways to serve, adapting ministry to the local context, and blessing the neighborhood rather than only serving insiders.",
  "Creates Ministry Ownership": "Creates Ministry Ownership reflects the ability to move people from attendance into shared responsibility. It includes helping people buy into the vision, giving away meaningful responsibility, equipping teams, building shared identity, and creating systems where ministry continues without everything depending on the primary leader.",
  "Committed to Kingdom Growth": "Committed to Kingdom Growth reflects a deep commitment to discipleship, mission, outreach, and multiplication. It includes resisting maintenance-only ministry, valuing growth as spiritual and relational transformation, celebrating Kingdom fruit beyond one organization, and seeking more and better disciples for the sake of God’s mission.",
  "Intrinsically Motivated": "Intrinsically Motivated reflects the candidate’s inner drive, initiative, and perseverance. It includes working from a sense of call rather than recognition, following through without constant external pressure, anticipating needed work, persisting through slow seasons, and being willing to build from little or nothing.",
};


const KNOCKOUT_QUALITIES = new Set(['Spousal Cooperation','Effectively Builds Relationships','Visionizing Capacity','Relates to the Lost and Unchurched','Creates Ministry Ownership','Intrinsically Motivated']);
function qualityHtmlName(name) {
  const safe = escapeHtml(name);
  return KNOCKOUT_QUALITIES.has(name) ? `<strong>${safe}*</strong>` : safe;
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

    <h2 style="font-size:20px;">Character Quality Descriptions</h2>
    <p style="color:#4b5563;">Knock-out Factor categories appear in bold with an asterisk.</p>
    <div style="border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
      ${results.map(item => `<div style="padding:12px 14px;border-bottom:1px solid #e5e7eb;"><div style="font-weight:700;margin-bottom:4px;">${qualityHtmlName(item.name)}: ${escapeHtml(item.score ?? 'N/A')} — ${escapeHtml(item.label)}</div>${escapeHtml(QUALITY_DEFINITIONS[item.name] || '')}</div>`).join('')}
    </div>

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
${(s.results || []).map(item => `${KNOCKOUT_QUALITIES.has(item.name)?item.name+'*':item.name}: ${item.score ?? 'N/A'} - ${item.label}`).join('\n')}

Character Quality Descriptions:
${(s.results || []).map(item => `${KNOCKOUT_QUALITIES.has(item.name)?item.name+'*':item.name}: ${item.score ?? 'N/A'} - ${item.label}. ${QUALITY_DEFINITIONS[item.name] || ''}`).join('\n')}

This report is a discernment tool and should be reviewed alongside interviews, coach observations, and the broader Discernment Center process.`;
}
