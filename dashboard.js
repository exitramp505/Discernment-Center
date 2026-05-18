(async function(){
  dcAuth.setupLogout();
  const user = await dcAuth.requireUser();
  if (!user) return;

  const sb = await dcAuth.getSupabaseClient();
  const session = await sb.auth.getSession();
  const accessToken = session.data?.session?.access_token || '';

  const profile = await dcAuth.getProfile(user.id).catch(() => null);
  const profileComplete = Boolean(profile?.full_name && profile?.phone && profile?.state && profile?.married);
  if(!profileComplete){
    window.location.href = 'profile.html?next=dashboard';
    return;
  }
  document.getElementById('welcomeTitle').textContent = `Welcome${profile?.full_name ? `, ${profile.full_name}` : ''}`;

  const workList = document.getElementById('candidateWorkList');

  let applicationRecord = null;
  let assignments = [];

  try {
    const res = await fetch('/.netlify/functions/application-get', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json().catch(() => ({}));
    if (data.ok && data.application) applicationRecord = data.application;
  } catch (_) {}

  try {
    const res = await fetch('/.netlify/functions/candidate-assignments-get', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json().catch(() => ({}));
    if (data.ok && Array.isArray(data.assignments)) assignments = data.assignments;
  } catch (_) {}

  const assignedKeys = new Set(assignments.filter(a => a.status === 'assigned').map(a => a.item_key));

  const { data: reports, error } = await sb
    .from('assessment_results')
    .select('id,created_at,candidate,scores,state,region,overall,overall_label,email_sent')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    workList.innerHTML = `<div class="card"><p class="warningText">${escapeHtml(error.message)}</p></div>`;
    return;
  }

  const allReports = reports || [];
  const characterReport = allReports.find(r => (r.scores?.assessmentType || '') !== 'isa_readiness');
  const isaReport = allReports.find(r => r.scores?.assessmentType === 'isa_readiness');

  const assignedItems = [
    assignedKeys.has('discernment_application') ? applicationCard(applicationRecord) : '',
    assignedKeys.has('character_qualities') ? assessmentCard({
      title: 'Character Qualities Assessment',
      description: 'Fifteen character qualities used to help the Discernment Center team discuss readiness, strengths, and growth areas.',
      report: characterReport,
      draftKey: `discernment_character_draft_${(profile?.email || user.email || '').toLowerCase()}`,
      startUrl: 'assessment.html',
      retakeUrl: 'assessment.html',
      unit: ''
    }) : '',
    assignedKeys.has('ministry_readiness') ? assessmentCard({
      title: 'Ministry Readiness Inventory',
      description: 'Church planting, entrepreneurial leadership, ministry experience, and relational evangelism readiness profile.',
      report: isaReport,
      draftKey: `discernment_isa_draft_${(profile?.email || user.email || '').toLowerCase()}`,
      startUrl: 'isa-assessment.html',
      retakeUrl: 'isa-assessment.html',
      unit: '%'
    }) : ''
  ].filter(Boolean);

  const applicationSubmitted = applicationRecord?.status === 'submitted';
  const assessmentsCompleted = [
    assignedKeys.has('character_qualities') && characterReport,
    assignedKeys.has('ministry_readiness') && isaReport
  ].filter(Boolean).length;
  const totalCompleted = (assignedKeys.has('discernment_application') && applicationSubmitted ? 1 : 0) + assessmentsCompleted;
  const totalAssigned = assignedKeys.size;
  const stillToComplete = Math.max(totalAssigned - totalCompleted, 0);

  setText('applicationSubmittedCount', applicationSubmitted && assignedKeys.has('discernment_application') ? '1' : '0');
  setText('assessmentsCompletedCount', String(assessmentsCompleted));
  setText('totalCompletedCount', String(totalCompleted));
  setText('stillToCompleteCount', String(stillToComplete));

  if (!assignedItems.length) {
    workList.innerHTML = `<article class="candidateTaskCard compact">
      <div class="candidateTaskHead">
        <div class="candidateTaskTitleRow">
          <div class="candidateCheckIcon">•</div>
          <div class="candidateTaskTitleText">
            <h3>No Assigned Items Yet</h3>
            <p>Your Discernment Center coordinator has not assigned any forms or assessments to your account yet. Please check back later.</p>
          </div>
          <span class="candidatePill pending">Waiting</span>
        </div>
      </div>
    </article>`;
  } else {
    workList.innerHTML = assignedItems.join('');
  }

  function applicationCard(app) {
    const submitted = app?.status === 'submitted';
    const started = Boolean(app);
    const completion = app?.completion ?? 0;
    const submittedDate = app?.submitted_at || app?.submittedAt || app?.updated_at || app?.updatedAt;
    const hasPhoto = Boolean(app?.photo_name || app?.photoName);
    const hasResume = Boolean(app?.resume_name || app?.resumeName);
    const uploadText = hasPhoto || hasResume
      ? `${hasPhoto ? 'Photo' : ''}${hasPhoto && hasResume ? ' + ' : ''}${hasResume ? 'Resume' : ''}`
      : 'Not Uploaded';

    if (!submitted) {
      return `<article class="candidateTaskCard compact">
        <div class="candidateTaskHead">
          <div class="candidateTaskTitleRow">
            <div class="candidateCheckIcon">•</div>
            <div class="candidateTaskTitleText">
              <h3>Discernment Center Application</h3>
              <p>${started ? `${completion || 0}% complete. Finish and submit your application when ready.` : 'Begin your Discernment Center Application.'}</p>
            </div>
            <span class="candidatePill ${started ? 'draft' : 'pending'}">${started ? 'Draft' : 'Not Started'}</span>
          </div>
          <div class="candidateTaskActions">
            <a class="candidateBtn" href="application.html">${started ? 'Finish Application' : 'Start Application'}</a>
          </div>
        </div>
      </article>`;
    }

    return `<article class="candidateTaskCard completed">
      <div class="candidateTaskHead">
        <div class="candidateTaskTitleRow">
          <div class="candidateCheckIcon">✓</div>
          <div class="candidateTaskTitleText">
            <h3>Discernment Center Application</h3>
            <p>Personal information, family, faith story, ministry experience, financial overview, planting vision, waiver, photo, and resume.</p>
          </div>
          <span class="candidatePill done">Submitted</span>
        </div>
        <div class="candidateTaskActions">
          <a class="candidateBtn green" href="application-report.html">View Submitted Application</a>
          <a class="candidateBtn secondary" href="application.html">Edit Application</a>
        </div>
      </div>
      <div class="candidateTaskMeta">
        <div class="candidateMetric primary">
          <strong>${completion || 100}%</strong>
          <span>Complete</span>
        </div>
        <div class="candidateMetric">
          <strong>${submittedDate ? formatShortDate(submittedDate) : '—'}</strong>
          <span>Submitted</span>
        </div>
        <div class="candidateMetric">
          <strong>${escapeHtml(uploadText)}</strong>
          <span>Uploads</span>
        </div>
      </div>
    </article>`;
  }

  function assessmentCard({ title, description, report, draftKey, startUrl, retakeUrl, unit }) {
    const completed = Boolean(report);
    const hasDraft = !completed && hasLocalDraft(draftKey);

    if (!completed) {
      return `<article class="candidateTaskCard compact">
        <div class="candidateTaskHead">
          <div class="candidateTaskTitleRow">
            <div class="candidateCheckIcon">•</div>
            <div class="candidateTaskTitleText">
              <h3>${escapeHtml(title)}</h3>
              <p>${hasDraft ? 'Progress has been saved. Continue and finish the assessment when ready.' : escapeHtml(description)}</p>
            </div>
            <span class="candidatePill ${hasDraft ? 'draft' : 'pending'}">${hasDraft ? 'In Progress' : 'Not Started'}</span>
          </div>
          <div class="candidateTaskActions">
            <a class="candidateBtn" href="${startUrl}">${hasDraft ? 'Finish Assessment' : 'Start Assessment'}</a>
          </div>
        </div>
      </article>`;
    }

    const score = report?.overall ?? report?.scores?.overall ?? '—';
    const label = report?.overall_label || report?.scores?.overallLabel || '—';
    const date = report?.created_at || report?.submittedAt;
    const reportUrl = `report.html?id=${encodeURIComponent(report.id)}`;

    return `<article class="candidateTaskCard completed">
      <div class="candidateTaskHead">
        <div class="candidateTaskTitleRow">
          <div class="candidateCheckIcon">✓</div>
          <div class="candidateTaskTitleText">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(description)}</p>
          </div>
          <span class="candidatePill done">Completed</span>
          <span class="candidatePill report">Report Available</span>
        </div>
        <div class="candidateTaskActions">
          <a class="candidateBtn green" href="${reportUrl}">View Report</a>
          <a class="candidateBtn secondary" href="${retakeUrl}">Retake Assessment</a>
        </div>
      </div>
      <div class="candidateTaskMeta">
        <div class="candidateMetric primary">
          <strong>${escapeHtml(score)}${unit}</strong>
          <span>Overall</span>
        </div>
        <div class="candidateMetric">
          <strong>${escapeHtml(label)}</strong>
          <span>Rating</span>
        </div>
        <div class="candidateMetric">
          <strong>${date ? formatShortDate(date) : '—'}</strong>
          <span>Completed</span>
        </div>
      </div>
    </article>`;
  }

  function hasLocalDraft(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      const draft = JSON.parse(raw);
      return draft && draft.answers && Object.keys(draft.answers).length > 0;
    } catch (_) {
      return false;
    }
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function formatShortDate(value) {
    try {
      return new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (_) {
      return '—';
    }
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }
})();
