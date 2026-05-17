
const QUALITY_DEFINITIONS={
 "Resilience":"Resilience reflects the candidate’s capacity to keep moving faithfully when ministry becomes difficult. It includes emotional steadiness under pressure, the ability to recover after disappointment or criticism, and the maturity to learn from setbacks without becoming defeated, reactive, or withdrawn.",
 "Spousal Cooperation":"For married candidates, Spousal Cooperation reflects the health of shared calling and family alignment. It looks at whether ministry expectations are openly discussed, whether roles and boundaries are clear, and whether the couple can protect family life while serving together through the demands of ministry.",
 "Financial Responsibility":"Financial Responsibility reflects the candidate’s stewardship, discipline, and credibility with resources. It includes managing personal finances wisely, avoiding unnecessary financial pressure, living within realistic limits, and demonstrating the trustworthiness needed to handle church or ministry funds with integrity.",
 "Builds Group Cohesiveness":"Builds Group Cohesiveness reflects the ability to gather people into a unified ministry community. It includes helping newcomers belong, keeping a group focused on mission, building morale, encouraging collaboration, and addressing conflict in ways that preserve trust and move people forward together.",
 "Effectively Builds Relationships":"Effectively Builds Relationships reflects the candidate’s ability to form genuine, trust-building connections with people. It includes taking initiative relationally, listening well, responding to needs with compassion, helping others feel safe and valued, and relating wisely across different personalities and backgrounds.",
 "Flexible and Adaptable":"Flexible and Adaptable reflects the candidate’s ability to adjust without losing mission clarity. It includes handling ambiguity, changing methods when circumstances require it, responding creatively to challenges, and adapting leadership priorities through different seasons of ministry growth and pressure.",
 "Exercises Faith":"Exercises Faith reflects a pattern of leadership rooted in dependence on God rather than anxiety, control, or self-reliance. It includes conviction about calling, prayerful decision-making, expectancy that God is at work, willingness to obey before outcomes are guaranteed, and patience to wait on God’s timing.",
 "Cultural Agility":"Cultural Agility reflects the candidate’s ability to understand and serve people whose background, assumptions, or lived experience differ from their own. It includes humility, curiosity, cultural awareness, and the ability to adapt communication and ministry approaches to the actual people being reached.",
 "Visionizing Capacity":"Visionizing Capacity reflects the ability to see and communicate a compelling ministry future. It includes forming a clear picture of what God may be building, translating vision into practical next steps, helping others see beyond present limitations, and treating challenges as opportunities rather than dead ends.",
 "Utilizes Giftedness of Others":"Utilizes Giftedness of Others reflects the candidate’s ability to recognize, develop, and release the gifts of people around them. It includes matching people to meaningful opportunities, delegating wisely, equipping before assigning responsibility, and building ministry that does not depend entirely on one leader.",
 "Relates to the Lost and Unchurched":"Relates to the Lost and Unchurched reflects the candidate’s ability to build authentic connection with people outside the church. It includes communicating faith naturally, understanding questions and barriers unchurched people carry, creating welcoming pathways, and moving toward spiritually curious or disconnected people with confidence and care.",
 "Responsive to Community":"Responsive to Community reflects the candidate’s attentiveness to the real life, needs, culture, and pulse of the surrounding community. It includes listening before acting, identifying practical ways to serve, adapting ministry to the local context, and blessing the neighborhood rather than only serving insiders.",
 "Creates Ministry Ownership":"Creates Ministry Ownership reflects the ability to move people from attendance into shared responsibility. It includes helping people buy into the vision, giving away meaningful responsibility, equipping teams, building shared identity, and creating systems where ministry continues without everything depending on the primary leader.",
 "Committed to Kingdom Growth":"Committed to Kingdom Growth reflects a deep commitment to discipleship, mission, outreach, and multiplication. It includes resisting maintenance-only ministry, valuing growth as spiritual and relational transformation, celebrating Kingdom fruit beyond one organization, and seeking more and better disciples for the sake of God’s mission.",
 "Intrinsically Motivated":"Intrinsically Motivated reflects the candidate’s inner drive, initiative, and perseverance. It includes working from a sense of call rather than recognition, following through without constant external pressure, anticipating needed work, persisting through slow seasons, and being willing to build from little or nothing.",
};
const KNOCKOUT_QUALITIES=new Set(['Spousal Cooperation','Effectively Builds Relationships','Visionizing Capacity','Relates to the Lost and Unchurched','Creates Ministry Ownership','Intrinsically Motivated']);
function qualityNameHtml(name){const safe=esc(name); return KNOCKOUT_QUALITIES.has(name)?`<strong class="knockoutQuality">${safe}<span class="knockoutStar">*</span></strong>`:safe;}
function knockoutBadge(name){return KNOCKOUT_QUALITIES.has(name)?'<span class="knockoutBadge">Knock-Out Factor</span>':''}
function scoreToneClass(score){if(score===null||score===undefined)return 'scoreNA';const n=Number(score);if(n<3)return 'scoreBelow';if(n===3)return 'scoreEvident';if(n<4.5)return 'scoreAbove';return 'scoreHigh'}
function rgbaFromRgb(rgb,alpha){const m=String(rgb).match(/\d+/g);return m&&m.length>=3?`rgba(${m[0]},${m[1]},${m[2]},${alpha})`:rgb}
function scoreBadgeStyle(score){if(score===null||score===undefined)return ''; const c=chartColor(score); return `background:${rgbaFromRgb(c,.13)};border-color:${rgbaFromRgb(c,.38)};color:${c};box-shadow:inset 0 0 0 1px rgba(255,255,255,.72);`}
const SECTION_NAMES=['Resilience','Spousal Cooperation','Financial Responsibility','Builds Group Cohesiveness','Effectively Builds Relationships','Flexible and Adaptable','Exercises Faith','Cultural Agility','Visionizing Capacity','Utilizes Giftedness of Others','Relates to the Lost and Unchurched','Responsive to Community','Creates Ministry Ownership','Committed to Kingdom Growth','Intrinsically Motivated'];

const STATES={AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming'};

const REGION_BY_STATE={WA:'Pacific',HI:'Pacific',AK:'Pacific',AZ:'Pacific',UT:'Pacific',CA:'Pacific',NV:'Pacific',ID:'Pacific',OR:'Pacific',TX:'Central',OK:'Central',AR:'Central',WI:'Central',MN:'Central',IA:'Central',IL:'Central',MO:'Central',KS:'Central',CO:'Mountain Plains',WY:'Mountain Plains',NE:'Mountain Plains',SD:'Mountain Plains',ND:'Mountain Plains',MT:'Mountain Plains',NH:'East',VT:'East',MA:'East',ME:'East',RI:'East',CT:'East',NJ:'East',DE:'East',MD:'East',WV:'East',PA:'East',OH:'East',VA:'East',KY:'East',TN:'East',IN:'East',MI:'East',NY:'East',FL:'South East',GA:'South East',AL:'South East',MS:'South East',LA:'South East',SC:'South East',NC:'South East',PR:'South East'};
const REGION_ORDER=['Pacific','Mountain Plains','Central','East','South East'];
function regionForState(state){return REGION_BY_STATE[state]||'Unassigned'}

let password='';
let submissions=[];
let applications=[];

function initAdmin(){
  regionFilter.innerHTML='<option value="">All regions</option>'+REGION_ORDER.map(region=>`<option value="${region}">${region}</option>`).join('');
  password=sessionStorage.getItem('dc_admin_password')||'';
  if(password){adminPassword.value=password;loadSubmissions();}
  loginBtn.addEventListener('click',()=>{password=adminPassword.value.trim();sessionStorage.setItem('dc_admin_password',password);loadSubmissions();});
  logoutBtn.addEventListener('click',()=>{sessionStorage.removeItem('dc_admin_password');password='';dashboard.classList.add('hidden');loginCard.classList.remove('hidden');logoutBtn.classList.add('hidden');adminPassword.value='';});
  searchInput.addEventListener('input',renderList);
  regionFilter.addEventListener('change',renderList);
  sortSelect.addEventListener('change',renderList);
}

async function adminFetch(payload){
  const res=await fetch('/.netlify/functions/admin-submissions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password,...payload})});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||!data.ok) throw new Error(data.error||'Dashboard request failed.');
  return data;
}

async function loadSubmissions(){
  loginMessage.textContent='Loading submissions...';
  try{
    const data=await adminFetch({});
    submissions=data.submissions||[];
    applications=data.applications||[];
    loginCard.classList.add('hidden');
    dashboard.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    loginMessage.textContent='';
    renderList();
  }catch(err){
    loginMessage.textContent=err.message;
    dashboard.classList.add('hidden');
    loginCard.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
  }
}

function assessmentTitle(r){
  return r.assessmentTitle || (r.assessmentType==='isa_readiness' ? 'Ministry Readiness Inventory' : 'Character Qualities Assessment');
}
function candidateKey(r){
  const email=String(r.email||'').trim().toLowerCase();
  if(email) return `email:${email}`;
  return `candidate:${String(r.name||'').trim().toLowerCase()}|${String(r.phone||'').trim()}`;
}
function groupCandidates(rows){
  const map=new Map();
  for(const r of rows){
    const key=candidateKey(r);
    if(!map.has(key)){
      map.set(key,{key,name:r.name||'Unnamed Candidate',email:r.email||'',phone:r.phone||'',state:r.state||'',married:r.married||'',reports:[]});
    }
    const person=map.get(key);
    person.name=person.name==='Unnamed Candidate' && r.name ? r.name : person.name;
    person.email=person.email || r.email || '';
    person.phone=person.phone || r.phone || '';
    person.state=person.state || r.state || '';
    person.married=person.married || r.married || '';
    person.reports.push(r);
  }
  return Array.from(map.values()).map(person=>{
    person.reports.sort((a,b)=>new Date(b.submittedAt||0)-new Date(a.submittedAt||0));
    person.latestAt=person.reports[0]?.submittedAt || '';
    person.highestOverall=Math.max(...person.reports.map(r=>Number(r.overall||0)));
    person.lowestOverall=Math.min(...person.reports.map(r=>Number(r.overall||0)));
    person.region=regionForState(person.state);
    return person;
  });
}
function renderList(){
  let people=groupCandidates(submissions);
  const q=(searchInput.value||'').toLowerCase().trim();
  const selectedRegion=regionFilter.value;
  if(q){
    people=people.filter(person=>{
      const reportText=person.reports.map(r=>`${assessmentTitle(r)} ${r.overallLabel} ${r.overall}`).join(' ');
      return `${person.name} ${person.email} ${person.phone} ${person.state} ${STATES[person.state]||''} ${person.region} ${reportText}`.toLowerCase().includes(q);
    });
  }
  if(selectedRegion) people=people.filter(person=>person.region===selectedRegion);
  const sort=sortSelect.value;
  people.sort((a,b)=>{
    if(sort==='oldest') return new Date(a.latestAt||0)-new Date(b.latestAt||0);
    if(sort==='highest') return Number(b.highestOverall||0)-Number(a.highestOverall||0);
    if(sort==='lowest') return Number(a.lowestOverall||0)-Number(b.lowestOverall||0);
    if(sort==='name') return String(a.name||'').localeCompare(String(b.name||''));
    if(sort==='region') return String(a.region||'').localeCompare(String(b.region||'')) || String(a.name||'').localeCompare(String(b.name||''));
    return new Date(b.latestAt||0)-new Date(a.latestAt||0);
  });
  const reportCount=submissions.length;
  const candidateTotal=groupCandidates(submissions).length;
  if (typeof candidateCountStat !== 'undefined') candidateCountStat.textContent=String(candidateTotal);
  if (typeof completedItemCountStat !== 'undefined') completedItemCountStat.textContent=String(reportCount);
  countLine.textContent=`Showing ${people.length} candidate file${people.length===1?'':'s'}`;
  if(!people.length){submissionsList.innerHTML='<div class="card"><p class="muted">No candidates found.</p></div>';return;}
  submissionsList.innerHTML=people.map(personCard).join('');
  document.querySelectorAll('[data-open-report]').forEach(btn=>btn.addEventListener('click',()=>openReport(btn.dataset.openReport)));
}

function initialsFor(name){
  return String(name||'Candidate').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase() || 'C';
}
function formatDate(value){
  if(!value) return '—';
  const d=new Date(value);
  if(Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
}
function latestDate(person){return person.latestAt?formatDate(person.latestAt):'—'}
function itemStatusPill(person){
  const count=person.reports.length;
  return `<span class="adminPill complete">${count} Assessment${count===1?'':'s'} Complete</span>`;
}
function applicationStatus(person){
  // Application records will plug in here when the application module is built.
  return {status:'Not Started', complete:'—', date:'—', tone:'neutral', action:'View Candidate'};
}
function uploadStatus(person){
  // Upload records will plug in here when Supabase Storage is added for photo/resume.
  return {photo:'Missing', resume:'Missing'};
}
function personCard(person){
  const region=person.region || regionForState(person.state);
  const app=applicationStatus(person);
  const uploads=uploadStatus(person);
  return `<article class="adminCandidateCard">
    <div class="adminCandidateHead">
      <div class="adminCandidateIdentity">
        <div class="adminAvatar">${esc(initialsFor(person.name))}</div>
        <div>
          <div class="adminNameRow">
            <h3>${esc(person.name||'Unnamed Candidate')}</h3>
            <span class="adminPill region">${esc(region)} Region</span>
          </div>
          <div class="adminMeta">
            <span>${esc(STATES[person.state]||person.state||'No state')}</span>
            <span>${esc(person.email||'No email')}</span>
            <span>${esc(person.phone||'No phone')}</span>
            <span>Last activity: ${esc(latestDate(person))}</span>
          </div>
        </div>
      </div>
      <div class="adminHeadStatus">
        <span class="adminPill pending">Application ${esc(app.status)}</span>
        ${itemStatusPill(person)}
      </div>
    </div>

    <div class="adminCandidateFile">
      <section class="adminFileSection">
        <div class="adminFileHead"><strong>Assessments</strong><span>${person.reports.length} completed</span></div>
        ${person.reports.map(reportRow).join('') || emptyAdminRow('No assessments completed yet.')}
      </section>

      <section class="adminFileSection">
        <div class="adminFileHead"><strong>Forms</strong><span>Application module next</span></div>
        <div class="adminItemRow">
          <div>
            <div class="adminItemName">Discernment Center Application</div>
            <div class="adminItemDesc">Personal, family, faith, ministry, financial, vision, waiver, and conviction responses.</div>
          </div>
          <div class="adminMetric ${app.tone==='submitted'?'green':app.tone==='draft'?'gold':''}"><div class="num">${esc(app.status)}</div><div class="cap">Status</div></div>
          <div class="adminMetric"><div class="num">${esc(app.complete)}</div><div class="cap">Complete</div></div>
          <div class="adminMetric"><div class="num">${esc(app.date)}</div><div class="cap">Updated</div></div>
          <button type="button" class="adminOpen secondary" disabled>${esc(app.action)}</button>
        </div>
      </section>

      <section class="adminFileSection">
        <div class="adminFileHead"><strong>Uploads</strong><span>Photo and resume</span></div>
        <div class="adminUploadGrid">
          ${uploadItem('Candidate Photo', uploads.photo)}
          ${uploadItem('Resume', uploads.resume)}
        </div>
      </section>
    </div>
  </article>`;
}
function emptyAdminRow(message){return `<div class="adminEmptyRow">${esc(message)}</div>`}
function uploadItem(title,status){
  const uploaded=status && status!=='Missing';
  return `<div class="adminUploadItem">
    <div>
      <div class="adminUploadTitle">${esc(title)}</div>
      <div class="adminUploadMeta">${uploaded?esc(status):'Not uploaded'}</div>
    </div>
    <div class="adminMiniActions">
      <button type="button" class="adminTiny" disabled>${uploaded?'View':'Missing'}</button>
      ${uploaded?'<button type="button" class="adminTiny dark">Download</button>':''}
    </div>
  </div>`;
}
function reportRow(r){
  const date=r.submittedAt?formatDate(r.submittedAt):'—';
  const isIsa=r.assessmentType==='isa_readiness';
  const score=`${esc(r.overall||'')}${isIsa?'%':''}`;
  const label=esc(r.overallLabel||'');
  const scoreClass=isIsa ? (Number(r.overall)>=70?'green':Number(r.overall)>=50?'blue':'blue') : (Number(r.overall)>=3?'green':'blue');
  return `<div class="adminItemRow">
    <div>
      <div class="adminItemName">${esc(assessmentTitle(r))}</div>
      <div class="adminItemDesc">${isIsa?'Church planting, entrepreneurial leadership, ministry experience, and relational evangelism.':'15 character qualities with baseline profile and knockout indicators.'}</div>
      ${r.emailError?`<small class="warningText"><strong>Email Error:</strong> ${esc(r.emailError)}</small>`:''}
    </div>
    <div class="adminMetric ${scoreClass}"><div class="num">${score}</div><div class="cap">Overall</div></div>
    <div class="adminMetric"><div class="num">${label||'—'}</div><div class="cap">Rating</div></div>
    <div class="adminMetric"><div class="num">${esc(date)}</div><div class="cap">Submitted</div></div>
    <button type="button" class="adminOpen" data-open-report="${esc(r.id)}">Open Report</button>
  </div>`;
}


function safeFileName(value){
 return String(value||'discernment-report').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'discernment-report';
}

function characterPrintReportHtml(record){
  const c = record.candidate || {};
  const s = record.scores || {};
  const results = s.results || [];
  const stateLabel = STATES[c.state] || c.state || '';
  const regionLabel = regionForState(c.state) || record.region || c.region || '';
  const contactLine = [c.email, c.phone, [stateLabel, regionLabel ? `${regionLabel} Region` : null].filter(Boolean).join(' / ')].filter(Boolean).join(' · ');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${esc((c.name || 'Candidate') + ' - Character Qualities Assessment')}</title>
  <style>
    @page { size: Letter; margin: 0.45in; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #1f2933;
      font-family: Inter, Arial, Helvetica, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body { font-size: 10px; line-height: 1.35; }
    .hero {
      border: 1px solid #d9e2ec;
      border-radius: 22px;
      padding: 22px;
      display: grid;
      grid-template-columns: 1fr 100px;
      gap: 22px;
      align-items: center;
      margin-bottom: 14px;
    }
    .eyebrow {
      font-size: 9px;
      letter-spacing: .14em;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 850;
      margin-bottom: 5px;
    }
    h1 {
      margin: 0 0 8px;
      color: #1e88c9;
      font-size: 25px;
      line-height: 1.08;
      letter-spacing: -.035em;
    }
    .muted { color: #64748b; }
    .scoreBadge {
      border: 3px solid #9bbf2f;
      border-radius: 22px;
      min-height: 82px;
      display: grid;
      place-items: center;
      text-align: center;
      background: #fffdf5;
      padding: 10px;
    }
    .scoreBadge strong { display:block; font-size: 30px; line-height: 1; color: #0f172a; }
    .scoreBadge span { display:block; margin-top: 5px; font-size: 10px; font-weight: 850; color: #52617a; }

    .section {
      border: 1px solid #d9e2ec;
      border-radius: 18px;
      padding: 16px;
      margin-bottom: 14px;
      page-break-inside: auto;
      break-inside: auto;
    }
    h2 {
      margin: 0 0 8px;
      font-size: 17px;
      line-height: 1.1;
      color: #1f2933;
    }
    p { margin: 0 0 8px; color: #52617a; }

    .profileTable {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #d9e2ec;
      border-radius: 12px;
      overflow: hidden;
      font-size: 8.4px;
    }
    .profileTable th {
      background: #0f172a;
      color: #fff;
      text-align: left;
      padding: 7px;
      font-size: 8px;
    }
    .profileTable td {
      border-top: 1px solid #e7edf5;
      padding: 7px;
      vertical-align: middle;
    }
    .profileTable tr:nth-child(even) td { background: #f8fafc; }
    .profileName { font-weight: 850; }
    .scoreCell { width: 90px; font-weight: 850; text-align: center; }
    .labelCell { width: 120px; color: #52617a; font-weight: 750; }
    .baselineCell { width: 160px; }
    .track {
      height: 8px;
      background: linear-gradient(90deg,#eef3ff 0%,#eef3ff 49%,#475569 49%,#475569 51%,#eefbf4 51%,#eefbf4 100%);
      border-radius: 999px;
      position: relative;
    }
    .dot {
      width: 11px;
      height: 11px;
      border-radius: 50%;
      position: absolute;
      top: -1.5px;
      transform: translateX(-50%);
      box-shadow: 0 0 0 2px white;
    }

    .qualityList {
      display: block;
    }
    .qualityItem {
      border: 1px solid #d9e2ec;
      border-radius: 14px;
      padding: 12px 14px;
      margin-bottom: 10px;
      page-break-inside: avoid;
      break-inside: avoid;
      background: #fff;
    }
    .qualityItem.knockout {
      border-color: #f3d7a8;
      background: #fffdf9;
    }
    .qualityTop {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 14px;
      align-items: start;
      margin-bottom: 8px;
    }
    h3 {
      margin: 0;
      font-size: 12.5px;
      line-height: 1.15;
      color: #1f2933;
    }
    .qualityScore {
      min-width: 78px;
      border: 1px solid #bee8cf;
      border-radius: 11px;
      background: #e7f6ee;
      text-align: center;
      padding: 7px 8px;
      font-weight: 850;
      color: #16834a;
    }
    .qualityScore.low {
      border-color: #cfe1fa;
      background: #e8f1fb;
      color: #1e40af;
    }
    .qualityScore em {
      display: block;
      margin-top: 2px;
      font-style: normal;
      font-size: 7.2px;
      color: #52617a;
      line-height: 1.1;
    }
    .badge {
      display: inline-block;
      margin-top: 5px;
      border-radius: 999px;
      background: #fff6dc;
      color: #9a5511;
      font-size: 7px;
      font-weight: 900;
      padding: 4px 7px;
      text-transform: uppercase;
      letter-spacing: .05em;
    }
    .qualityItem p {
      margin: 0;
      font-size: 9.5px;
      line-height: 1.38;
      color: #52617a;
    }
  </style>
</head>
<body>
  <div class="hero">
    <div>
      <div class="eyebrow">Discernment Center</div>
      <h1>${esc(c.name || 'Candidate')} Character Qualities Assessment</h1>
      <div class="muted">${esc(contactLine)}</div>
    </div>
    <div class="scoreBadge">
      <div>
        <strong>${esc(s.overall || '')}</strong>
        <span>${esc(s.overallLabel || '')}</span>
      </div>
    </div>
  </div>

  <section class="section">
    <h2>Understanding the Character Qualities</h2>
    <p>The fifteen character qualities are not meant to function like a pass or fail test. They give the Discernment Center team a shared language for discussing a candidate's readiness, strengths, and growth areas.</p>
    <p>A score of <strong>3.0</strong> is the baseline, meaning the quality is evident at a normal and expected level for this stage of discernment. Scores below 3.0 may point to growth areas. Scores above 3.0 may point to relative strengths.</p>
  </section>

  <section class="section">
    <h2>Character Quality Score Profile</h2>
    <table class="profileTable">
      <thead>
        <tr>
          <th>Character Quality</th>
          <th>Score</th>
          <th>Interpretation</th>
          <th>Baseline View</th>
        </tr>
      </thead>
      <tbody>
        ${results.map(x => {
          const score = x.score === null || x.score === undefined ? null : Number(x.score);
          const pos = score === null ? 50 : Math.max(0, Math.min(100, ((score - 1) / 4) * 100));
          const color = score === null ? '#94a3b8' : score < 3 ? '#2d6cdf' : '#2a9d8f';
          return `<tr>
            <td class="profileName">${qualityNameHtml(x.name)}</td>
            <td class="scoreCell">${esc(x.score ?? 'N/A')}</td>
            <td class="labelCell">${esc(x.label || '')}</td>
            <td class="baselineCell"><div class="track"><span class="dot" style="left:${pos}%;background:${color}"></span></div></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </section>

  <section class="section">
    <h2>Character Quality Descriptions</h2>
    <p>Use these descriptions as a quick guide for interpreting what each category is looking for. Knock-out Factor categories are marked with a badge.</p>
    <div class="qualityList">
      ${SECTION_NAMES.map(name => {
        const x = results.find(r => r.name === name) || {};
        const score = x.score === null || x.score === undefined ? null : Number(x.score);
        const isKnockout = KNOCKOUT_QUALITIES.has(name);
        const low = score !== null && score < 3;
        return `<article class="qualityItem ${isKnockout ? 'knockout' : ''}">
          <div class="qualityTop">
            <div>
              <h3>${qualityNameHtml(name)}</h3>
              ${isKnockout ? '<span class="badge">Knock-out Factor</span>' : ''}
            </div>
            <div class="qualityScore ${low ? 'low' : ''}">
              ${esc(x.score ?? 'N/A')}
              <em>${esc(x.label || '')}</em>
            </div>
          </div>
          <p>${esc(QUALITY_DEFINITIONS[name] || '')}</p>
        </article>`;
      }).join('')}
    </div>
  </section>
</body>
</html>`;
}


function printCurrentReport(){
  const payload = window.currentAdminReport;
  if (!payload) return;

  const isIsa = (payload.scores || {}).assessmentType === 'isa_readiness';
  const candidateName = (payload.candidate?.name || 'Candidate').trim();
  const reportTitle = isIsa ? 'Ministry Readiness Inventory Report' : 'Character Qualities Assessment';
  const title = `${candidateName} - ${reportTitle}`;
  const safeTitle = title.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  const report = document.getElementById('adminReport');
  if (!report || report.classList.contains('hidden')) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('The print window was blocked. Please allow pop-ups for this site and try again.');
    return;
  }

  const html = isIsa ? `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${safeTitle}</title>
  <link rel="stylesheet" href="style.css">
  <style>
    @page { size: Letter; margin: 0.45in; }
    html, body { background:#fff!important; color:#1f2933!important; -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
    body { margin:0; padding:0; font-family:Inter,Arial,Helvetica,sans-serif; }
    main { width:100%; max-width:none; margin:0; padding:0; }
    .actions,.reportPrintActions,button,.noPrint { display:none!important; }
    .isaReport,.isaReportV44 { display:block!important; width:100%!important; max-width:none!important; margin:0!important; padding:0!important; background:#fff!important; overflow:visible!important; }
    .reportSection,.isaReportTitle,.isaReportHeroV44,.isaScoreStripV44 { box-shadow:none!important; border:1px solid #d9e2ec!important; break-inside:avoid; page-break-inside:avoid; }
    .isaReportHeroV44 { padding:22px!important; margin-bottom:14px!important; }
    .isaReportHeroV44 h2 { font-size:25px!important; line-height:1.1!important; }
    .isaOverall { width:96px!important; min-width:96px!important; padding:12px!important; }
    .isaOverall strong { font-size:30px!important; }
    .isaScoreStripV44 { grid-template-columns:repeat(4,1fr)!important; gap:8px!important; padding:12px!important; margin-bottom:14px!important; }
    .isaScoreCard { padding:10px!important; }
    .isaScoreCard strong { font-size:9px!important; }
    .isaScoreCard em { font-size:14px!important; }
    .reportSection { padding:16px!important; margin:0 0 14px!important; border-radius:16px!important; overflow:visible!important; }
    .reportSection h3,.isaGuideBlock h3,.isaReportBlock h3 { font-size:18px!important; margin-bottom:8px!important; }
    .isaSectionLead,.isaHowToRead p,.muted { font-size:9.5px!important; line-height:1.35!important; }
    .isaGuideGrid { grid-template-columns:1fr 1fr!important; gap:10px!important; }
    .isaGuideCard { padding:12px!important; break-inside:avoid; }
    .isaGuideCard h4 { font-size:12px!important; }
    .isaDefinitionList > div { grid-template-columns:92px 1fr!important; gap:8px!important; padding-top:7px!important; }
    .isaDefinitionList strong,.isaLegendList strong { font-size:8px!important; }
    .isaDefinitionList p,.isaLegendList p { font-size:7.5px!important; line-height:1.25!important; }
    .isaLegendList { gap:7px!important; }
    .isaLegendList > div { padding:9px!important; }
    .isaInterpretGrid { grid-template-columns:repeat(3,1fr)!important; gap:8px!important; }
    .isaInterpretCard { padding:10px!important; }
    .isaInterpretCard strong { font-size:9px!important; }
    .isaInterpretCard p { font-size:7.5px!important; }
    .isaReflectionBox { padding:10px!important; font-size:8px!important; }
    .isaComparisonWrap { overflow:visible!important; }
    .isaComparisonGrid,.isaComparisonGridV44 { min-width:0!important; width:100%!important; grid-template-columns:105px repeat(4,1fr)!important; font-size:8px!important; }
    .isaGridHeader { font-size:7px!important; padding:8px!important; }
    .isaRowLabel { font-size:8px!important; padding:8px!important; }
    .isaRowLabel span { font-size:5.5px!important; }
    .isaGridCell { padding:8px!important; }
    .isaMiniBar { grid-template-columns:1fr 28px!important; gap:5px!important; }
    .isaMiniBar em { font-size:7px!important; }
    .isaSuggestionGrid { grid-template-columns:1fr 1fr!important; gap:9px!important; }
    .isaSuggestionCard { padding:12px!important; break-inside:avoid; }
    .isaSuggestionCard h4 { font-size:11px!important; }
    .isaSuggestionCard p { font-size:8px!important; line-height:1.3!important; }
    .isaTag { font-size:6px!important; padding:4px 7px!important; }
    .isaCategoryCards { grid-template-columns:1fr 1fr!important; gap:9px!important; }
    .isaCategoryCard { break-inside:avoid; padding:10px!important; }
    .isaCategoryCard h4 { font-size:10px!important; }
    .isaCategoryCard p,.isaCategoryCard small { font-size:7.5px!important; }
    .isaDepthTable,.isaDepthTableV44 { width:100%!important; font-size:7px!important; border-collapse:collapse!important; break-inside:auto!important; page-break-inside:auto!important; }
    .isaDepthTable th,.isaDepthTableV44 th { font-size:7px!important; padding:6px!important; }
    .isaDepthTable td,.isaDepthTableV44 td { padding:5px 6px!important; line-height:1.2!important; }
    .isaDepthTable tr,.isaDepthTableV44 tr { break-inside:avoid!important; page-break-inside:avoid!important; }
    .isaDepthTable thead,.isaDepthTableV44 thead { display:table-header-group!important; }
    .isaDepthTable tbody,.isaDepthTableV44 tbody { display:table-row-group!important; }
  </style>
</head>
<body><main>${report.innerHTML}</main></body>
</html>` : characterPrintReportHtml(payload);

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 600);
}

async function downloadReport(){
 printCurrentReport();
}

function closeReport(){
  const adminReport = document.getElementById('adminReport');
  if (!adminReport) return;
  adminReport.innerHTML = '';
  adminReport.classList.add('hidden');
  window.currentAdminReport = null;
  window.currentAdminApplication = null;
}

async function openReport(id){
  adminReport.classList.remove('hidden');
  adminReport.innerHTML='<p class="muted">Loading report...</p>';
  try{
    const data=await adminFetch({id});
    window.currentAdminReport=data.submission;
    const actionLabel='Print / Save as PDF';
    adminReport.innerHTML=reportHtml(data.submission)+`<div class="actions reportPrintActions"><button type="button" onclick="downloadReport()">${actionLabel}</button><button type="button" class="secondary" onclick="closeReport()">Close Report</button></div>`;
    window.scrollTo({top:adminReport.offsetTop-10,behavior:'smooth'});
  }catch(err){
    adminReport.innerHTML=`<p class="warningText">${esc(err.message)}</p>`;
  }
}

function characterQualityIntro(){return `<section class="reportSection introPanel"><h3>Understanding the Character Qualities</h3><p>The fifteen character qualities are not meant to function like a pass or fail test. They give the Discernment Center team a shared language for discussing a candidate's readiness, strengths, and growth areas. A score of <strong>3.0</strong> is the baseline, meaning the quality is evident at a normal and expected level for this stage of discernment.</p><p class="muted">The visual profile below shows how each score relates to that baseline. Scores to the left of the center line point to growth areas. Scores to the right point to relative areas of strength. Spousal Cooperation appears as N/A for candidates who are not married and is not included in the overall score.</p></section>`}
function chartColor(score){if(score===null)return '#94a3b8'; const val=Number(score); if(val<3){const k=Math.max(0,Math.min(1,(val-1)/2)); const rr=Math.round(79+(37-79)*k); const g=Math.round(120+(99-120)*k); const b=Math.round(190+(235-190)*k); return `rgb(${rr},${g},${b})`} const k=Math.max(0,Math.min(1,(val-3)/2)); const rr=Math.round(42+(22-42)*k); const g=Math.round(157+(163-157)*k); const b=Math.round(143+(74-143)*k); return `rgb(${rr},${g},${b})`}
function visualScoreChart(results){results=results||[]; return `<section class="reportSection"><h3>Character Quality Score Profile</h3><p class="muted">The center line is the baseline score of 3.0. Each dot shows where that quality landed in relation to the baseline.</p><div class="profileLegend"><span>Lower</span><span>Baseline: 3.0</span><span>Higher</span></div><div class="profileChart">${results.map(x=>{const hasScore=!(x.score===null||x.score===undefined); const point=hasScore?((Number(x.score)-1)/4)*100:50; const width=hasScore?Math.abs(point-50):0; const left=hasScore?Math.min(point,50):50; const color=chartColor(x.score); return `<div class="profileRow"><div class="profileName">${qualityNameHtml(x.name)}</div><div class="profileTrack"><span class="baselineMarker"></span>${hasScore?`<span class="deviationBar" style="left:${left}%;width:${width}%;background:${color};"></span><span class="scoreDot" style="left:${point}%;background:${color};"></span>`:`<span class="naDot">N/A</span>`}</div><div class="profileValue"><strong>${esc(x.score??'N/A')}</strong><span>${esc(x.label)}</span></div></div>`}).join('')}</div></section>`}
function characterQualityDefinitions(results){const scoreMap=Object.fromEntries((results||[]).map(x=>[x.name,x])); return `<section class="reportSection"><h3>Character Quality Descriptions</h3><p class="muted">Use these descriptions as a quick guide for interpreting what each category is looking for. <strong>Knock-out Factor</strong> categories are marked with an asterisk and a small badge.</p><div class="qualityGrid">${SECTION_NAMES.map(name=>{const x=scoreMap[name]||{}; return `<article class="qualityCard ${KNOCKOUT_QUALITIES.has(name)?'knockoutCard':''}"><div class="qualityCardTop"><div><h4>${qualityNameHtml(name)}</h4>${knockoutBadge(name)}</div><span class="qualityScore ${scoreToneClass(x.score)}" style="${scoreBadgeStyle(x.score)}">${esc(x.score??'N/A')} <em>${esc(x.label||'')}</em></span></div><p>${esc(QUALITY_DEFINITIONS[name]||'')}</p></article>`}).join('')}</div></section>`}
function categoryTable(results){return `<table><tr><th>Character Quality</th><th>Score</th><th>Interpretation</th></tr>${(results||[]).map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.score??'N/A')}</td><td>${esc(x.label)}</td></tr>`).join('')}</table>`}

function scoreColor(v){v=Number(v)||0; if(v>=85)return '#6c9f3f'; if(v>=70)return '#9bbf2f'; if(v>=50)return '#e0b83e'; return '#b44b4b'}
function barColor(v){v=Number(v)||0; if(v>=70)return '#34d848'; if(v>=50)return '#f3d421'; return '#e21d2f'}

function firstNameOf(candidate){
  const full = (candidate && (candidate.name || candidate.full_name || candidate.fullName)) || 'Candidate';
  return String(full).trim().split(/\s+/)[0] || 'Candidate';
}
function isaSoftBar(v){
  return `<div class="isaMiniBar"><span style="width:${Number(v)||0}%;background:${barColor(v)}"></span><em>${esc(v)}%</em></div>`;
}
function isaReferenceBar(v){
  return `<div class="isaMiniBar isaSoftReferenceBar"><span style="width:${Number(v)||0}%;background:${barColor(v)}"></span><em>${esc(v)}%</em></div>`;
}
function isaScoreCard(cat){
  return `<div class="isaScoreCard">
    <strong>${esc(cat.name)}</strong>
    <div class="isaScoreTrack"><span style="width:${Number(cat.score)||0}%;background:${barColor(cat.score)}"></span></div>
    <em>${esc(cat.score)}%</em>
  </div>`;
}
function isaHowToReadHtml(){
  return `<section class="reportSection isaReportBlock isaGuideBlock">
    <h3>How to Read This Report</h3>
    <p class="isaSectionLead">This report is designed to help reviewers understand a candidate's ministry readiness profile. It does not determine calling, character, or final approval by itself. It gives the Discernment Center team a starting point for better conversation, coaching, and discernment.</p>

    <div class="isaGuideGrid">
      <div class="isaGuideCard">
        <h4>What This Report Measures</h4>
        <div class="isaDefinitionList">
          <div><strong>Church Planting</strong><p>Experience and exposure related to starting new ministry works, gathering people, building teams, raising support, and helping new ministry efforts take shape.</p></div>
          <div><strong>Entrepreneurial Leadership</strong><p>Initiative, risk tolerance, problem solving, vision, ownership, resilience, and leading in uncertain or undeveloped environments.</p></div>
          <div><strong>Ministry Experience</strong><p>Hands-on leadership experience in ministry settings, including teaching, team leadership, group development, supervising others, and building ministry systems.</p></div>
          <div><strong>Relational Evangelism</strong><p>Intentional engagement with people who do not yet know Jesus, including sharing faith, building relationships, discipling new believers, and helping others engage evangelistically.</p></div>
        </div>
      </div>

      <div class="isaGuideCard">
        <h4>How to Read the Comparison Chart</h4>
        <div class="isaLegendList">
          <div><strong>Planter</strong><p>This is the candidate's actual score based on their answers.</p></div>
          <div><strong>Benchmark</strong><p>This is a target readiness marker. It is not a pass/fail line. It helps show what stronger readiness may look like in each category.</p></div>
          <div><strong>Median</strong><p>This is the middle reference point from the comparison profile. It helps show whether the candidate is above, near, or below the typical comparison point.</p></div>
        </div>
      </div>
    </div>

    <div class="isaInterpretGrid">
      <div class="isaInterpretCard green"><strong>Above the Benchmark</strong><p>Likely strength. These areas may point to existing experience, confidence, or gifting that can be leveraged in church multiplication.</p></div>
      <div class="isaInterpretCard blue"><strong>Near the Benchmark</strong><p>Solid potential with room for further development. These areas may not be concerns, but they are worth discussing.</p></div>
      <div class="isaInterpretCard gold"><strong>Below the Median</strong><p>Conversation area. A lower score does not automatically disqualify someone, but it should not be ignored.</p></div>
    </div>

    <div class="isaReflectionBox">
      <strong>The best way to use this report is to ask:</strong>
      <ul>
        <li>What does this confirm?</li>
        <li>What does this raise questions about?</li>
        <li>What needs to be developed before or during the candidate's next step?</li>
      </ul>
    </div>
  </section>`;
}
function isaComparisonTable(categories, candidate){
  const first = firstNameOf(candidate);
  return `<section class="reportSection isaReportBlock">
    <h3>Comparison Chart</h3>
    <p class="muted isaReferenceNote"><strong>${esc(first)}'s score</strong> is shown in the Planter row. <strong>Benchmark</strong> and <strong>Median</strong> are static reference lines for comparison, not additional scores for ${esc(first)}.</p>
    <div class="isaComparisonWrap">
      <div class="isaComparisonGrid isaComparisonGridV44">
        <div class="isaGridHeader">Profiles</div>
        ${categories.map(c=>`<div class="isaGridHeader">${esc(c.name)}</div>`).join('')}

        <div class="isaRowLabel planterRow">Planter <span>Candidate Result</span></div>
        ${categories.map(c=>`<div class="isaGridCell planterCell">${isaSoftBar(c.score)}</div>`).join('')}

        <div class="isaRowLabel referenceRow">Benchmark <span>Static Reference</span></div>
        ${categories.map(c=>`<div class="isaGridCell referenceCell">${isaReferenceBar(c.benchmark)}</div>`).join('')}

        <div class="isaRowLabel referenceRow">Median <span>Static Reference</span></div>
        ${categories.map(c=>`<div class="isaGridCell referenceCell">${isaReferenceBar(c.median)}</div>`).join('')}
      </div>
    </div>
  </section>`;
}
function isaCandidateSuggestion(cats, candidate){
  const first = firstNameOf(candidate);
  const above = cats.filter(c=>Number(c.score)>=Number(c.benchmark)).map(c=>c.name);
  const belowMedian = cats.filter(c=>Number(c.score)<Number(c.median)).map(c=>c.name);
  const belowBenchmark = cats.filter(c=>Number(c.score)<Number(c.benchmark) && Number(c.score)>=Number(c.median)).map(c=>c.name);

  const strengthText = above.length
    ? `${first} shows stronger scores in ${above.join(' and ')}, suggesting existing experience or readiness that may be leveraged in church multiplication.`
    : `${first} does not currently score above the benchmark in any category. This does not disqualify the candidate, but it does suggest that readiness should be explored carefully through conversation and coaching.`;

  const conversationText = belowMedian.length
    ? `${belowMedian.join(' and ')} ${belowMedian.length===1?'is':'are'} below the median. This should become an important conversation area for assessors and coaches.`
    : `${first} does not have any category below the median. Reviewers should still explore the story behind the scores and look for development needs.`;

  const developmentText = belowBenchmark.length
    ? `${belowBenchmark.join(' and ')} ${belowBenchmark.length===1?'is':'are'} below the benchmark but at or above the median. This may indicate developing readiness with room for coaching and additional experience.`
    : `Areas below benchmark are either already noted as conversation areas or ${first} is above benchmark across the remaining categories.`;

  return `<section class="reportSection isaReportBlock">
    <h3>What ${esc(first)}'s Results Suggest</h3>
    <p class="isaSectionLead">These observations are not a verdict. They are prompts for discernment conversations with the candidate, spouse, assessors, coaches, and regional leadership.</p>
    <div class="isaSuggestionGrid">
      <article class="isaSuggestionCard strength"><span class="isaTag green">Likely Strength</span><h4>${above.length ? esc(above.join(' and ')) : 'No Category Above Benchmark'}</h4><p>${esc(strengthText)}</p></article>
      <article class="isaSuggestionCard conversation"><span class="isaTag gold">Conversation Area</span><h4>${belowMedian.length ? esc(belowMedian.join(' and ')) : 'No Category Below Median'}</h4><p>${esc(conversationText)}</p></article>
      <article class="isaSuggestionCard development"><span class="isaTag blue">Development Area</span><h4>${belowBenchmark.length ? esc(belowBenchmark.join(' and ')) : 'Continued Discernment'}</h4><p>${esc(developmentText)}</p></article>
      <article class="isaSuggestionCard"><span class="isaTag blue">Next Conversation</span><h4>Recommended Follow-Up</h4><p>Reviewers should ask where these scores confirm lived experience, where the candidate may need coaching, and what support would strengthen readiness before or during the next step.</p></article>
    </div>
  </section>`;
}
function isaInDepth(answers, candidate){
  const first = firstNameOf(candidate);
  const rows=Object.keys(answers||{}).map(k=>({id:Number(k),...(answers[k]||{})})).filter(x=>x.id).sort((a,b)=>a.id-b.id);
  return `<section class="reportSection isaReportBlock">
    <h3>ISA in Depth</h3>
    <p class="isaSectionLead">These are ${esc(first)}'s item-by-item answers. They should be used for context when discussing category scores, strengths, and possible development areas.</p>
    <table class="isaDepthTable isaDepthTableV44">
      <thead><tr><th>No.</th><th>Question</th><th>Answer</th><th>Group</th></tr></thead>
      <tbody>${rows.map(r=>`<tr><td>${esc(r.id)}</td><td>${esc(r.question)}</td><td>${esc(r.answer)}</td><td>${esc(r.group)}</td></tr>`).join('')}</tbody>
    </table>
  </section>`;
}

function reportHtml(record){
  if ((record.scores||{}).assessmentType === 'isa_readiness') return isaReportHtml(record);
  const c=record.candidate||{};
  const s=record.scores||{};
  const stateLabel=STATES[c.state]||c.state||'';
  const regionLabel=regionForState(c.state)||record.region||c.region||'';
  const contactLine=[c.email,c.phone,[stateLabel,regionLabel?`${regionLabel} Region`:null].filter(Boolean).join(' / ')].filter(Boolean).join(' · ');
  return `<div class="characterReportV48">
    <div class="characterReportHeroV48">
      <div>
        <div class="eyebrow">Discernment Center</div>
        <h2>${esc(c.name||'Candidate')} Candidate Assessment Report</h2>
        <p class="muted">${esc(contactLine)}</p>
      </div>
      <div class="characterOverallV48">
        <strong>${esc(s.overall||'')}</strong>
        <span>${esc(s.overallLabel||'')}</span>
      </div>
    </div>

    ${characterQualityIntro()}
    ${visualScoreChart(s.results||[])}
    ${characterQualityDefinitions(s.results||[])}
  </div>`;
}

function esc(value){return String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}


// Application-aware admin dashboard overrides
function candidateKeyFromParts(email, userId, name, phone){
  if(userId) return `user:${userId}`;
  const e=String(email||'').trim().toLowerCase();
  if(e) return `email:${e}`;
  return `candidate:${String(name||'').trim().toLowerCase()}|${String(phone||'').trim()}`;
}
function groupCandidates(rows){
  const map=new Map();
  for(const r of rows){
    const key=candidateKeyFromParts(r.email, r.userId, r.name, r.phone);
    if(!map.has(key)){
      map.set(key,{key,userId:r.userId||'',name:r.name||'Unnamed Candidate',email:r.email||'',phone:r.phone||'',state:r.state||'',married:r.married||'',reports:[],application:null});
    }
    const person=map.get(key);
    person.userId=person.userId || r.userId || '';
    person.name=person.name==='Unnamed Candidate' && r.name ? r.name : person.name;
    person.email=person.email || r.email || '';
    person.phone=person.phone || r.phone || '';
    person.state=person.state || r.state || '';
    person.married=person.married || r.married || '';
    person.reports.push(r);
  }
  for(const app of applications){
    const key=candidateKeyFromParts(app.email, app.userId, app.name, app.phone);
    if(!map.has(key)){
      map.set(key,{key,userId:app.userId||'',name:app.name||'Unnamed Candidate',email:app.email||'',phone:app.phone||'',state:app.state||'',married:'',reports:[],application:app});
    }
    const person=map.get(key);
    person.application=app;
    person.userId=person.userId || app.userId || '';
    person.name=person.name==='Unnamed Candidate' && app.name ? app.name : person.name;
    person.email=person.email || app.email || '';
    person.phone=person.phone || app.phone || '';
    person.state=person.state || app.state || '';
  }
  return Array.from(map.values()).map(person=>{
    person.reports.sort((a,b)=>new Date(b.submittedAt||0)-new Date(a.submittedAt||0));
    const dates=[person.reports[0]?.submittedAt, person.application?.updatedAt, person.application?.submittedAt].filter(Boolean);
    person.latestAt=dates.sort((a,b)=>new Date(b)-new Date(a))[0] || '';
    const scores=person.reports.map(r=>Number(r.overall||0)).filter(Boolean);
    person.highestOverall=scores.length?Math.max(...scores):0;
    person.lowestOverall=scores.length?Math.min(...scores):0;
    person.region=person.application?.region || regionForState(person.state);
    return person;
  });
}
function renderList(){
  let people=groupCandidates(submissions);
  const q=(searchInput.value||'').toLowerCase().trim();
  const selectedRegion=regionFilter.value;
  if(q){
    people=people.filter(person=>{
      const reportText=person.reports.map(r=>`${assessmentTitle(r)} ${r.overallLabel} ${r.overall}`).join(' ');
      const appText=person.application ? `application ${person.application.status} ${person.application.completion}` : '';
      return `${person.name} ${person.email} ${person.phone} ${person.state} ${STATES[person.state]||''} ${person.region} ${reportText} ${appText}`.toLowerCase().includes(q);
    });
  }
  if(selectedRegion) people=people.filter(person=>person.region===selectedRegion);
  const sort=sortSelect.value;
  people.sort((a,b)=>{
    if(sort==='oldest') return new Date(a.latestAt||0)-new Date(b.latestAt||0);
    if(sort==='highest') return Number(b.highestOverall||0)-Number(a.highestOverall||0);
    if(sort==='lowest') return Number(a.lowestOverall||0)-Number(b.lowestOverall||0);
    if(sort==='name') return String(a.name||'').localeCompare(String(b.name||''));
    if(sort==='region') return String(a.region||'').localeCompare(String(b.region||'')) || String(a.name||'').localeCompare(String(b.name||''));
    return new Date(b.latestAt||0)-new Date(a.latestAt||0);
  });
  const itemCount=submissions.length + applications.length;
  const candidateTotal=groupCandidates(submissions).length;
  if (typeof candidateCountStat !== 'undefined') candidateCountStat.textContent=String(candidateTotal);
  if (typeof completedItemCountStat !== 'undefined') completedItemCountStat.textContent=String(itemCount);
  countLine.textContent=`Showing ${people.length} candidate file${people.length===1?'':'s'}`;
  if(!people.length){submissionsList.innerHTML='<div class="card"><p class="muted">No candidates found.</p></div>';return;}
  submissionsList.innerHTML=people.map(personCard).join('');
  document.querySelectorAll('[data-open-report]').forEach(btn=>btn.addEventListener('click',()=>openReport(btn.dataset.openReport)));
  document.querySelectorAll('[data-open-application]').forEach(btn=>btn.addEventListener('click',()=>openApplication(btn.dataset.openApplication)));
  document.querySelectorAll('[data-file-kind]').forEach(btn=>btn.addEventListener('click',()=>openApplicationFile(btn.dataset.applicationId, btn.dataset.fileKind)));
}
function applicationStatus(person){
  const app=person.application;
  if(!app) return {status:'Not Started', complete:'—', date:'—', tone:'neutral', action:'View Candidate'};
  const submitted=app.status==='submitted';
  return {status:submitted?'Submitted':'Draft', complete:`${app.completion||0}%`, date:formatDate(app.submittedAt||app.updatedAt), tone:submitted?'submitted':'draft', action:submitted?'Open Application':'View Draft'};
}
function uploadStatus(person){
  const app=person.application||{};
  return {
    photo: app.hasPhoto ? (app.photoName || 'Uploaded') : 'Missing',
    resume: app.hasResume ? (app.resumeName || 'Uploaded') : 'Missing',
    appId: app.id || ''
  };
}
function personCard(person){
  const region=person.region || regionForState(person.state);
  const app=applicationStatus(person);
  const uploads=uploadStatus(person);
  const reportCount=person.reports.length;
  const appDisabled = person.application ? '' : 'disabled';
  return `<article class="adminCandidateCard">
    <div class="adminCandidateHead">
      <div class="adminCandidateIdentity">
        <div class="adminAvatar">${esc(initialsFor(person.name))}</div>
        <div>
          <div class="adminNameRow">
            <h3>${esc(person.name||'Unnamed Candidate')}</h3>
            <span class="adminPill region">${esc(region)} Region</span>
          </div>
          <div class="adminMeta">
            <span>${esc(STATES[person.state]||person.state||'No state')}</span>
            <span>${esc(person.email||'No email')}</span>
            <span>${esc(person.phone||'No phone')}</span>
            <span>Last activity: ${esc(latestDate(person))}</span>
          </div>
        </div>
      </div>
      <div class="adminHeadStatus">
        <span class="adminPill ${app.tone==='submitted'?'complete':app.tone==='draft'?'pending':'pending'}">Application ${esc(app.status)}</span>
        <span class="adminPill ${reportCount?'complete':'pending'}">${reportCount} Assessment${reportCount===1?'':'s'} Complete</span>
      </div>
    </div>

    <div class="adminCandidateFile">
      <section class="adminFileSection">
        <div class="adminFileHead"><strong>Assessments</strong><span>${reportCount} completed</span></div>
        ${person.reports.map(reportRow).join('') || emptyAdminRow('No assessments completed yet.')}
      </section>

      <section class="adminFileSection">
        <div class="adminFileHead"><strong>Forms</strong><span>${person.application ? app.status.toLowerCase() : 'not started'}</span></div>
        <div class="adminItemRow">
          <div>
            <div class="adminItemName">Discernment Center Application</div>
            <div class="adminItemDesc">Personal, family, faith, ministry, financial, vision, waiver, and conviction responses.</div>
          </div>
          <div class="adminMetric ${app.tone==='submitted'?'green':app.tone==='draft'?'gold':''}"><div class="num">${esc(app.status)}</div><div class="cap">Status</div></div>
          <div class="adminMetric"><div class="num">${esc(app.complete)}</div><div class="cap">Complete</div></div>
          <div class="adminMetric"><div class="num">${esc(app.date)}</div><div class="cap">Updated</div></div>
          <button type="button" class="adminOpen ${app.tone==='submitted'?'green':app.tone==='draft'?'gold':'secondary'}" data-open-application="${esc(person.application?.id||'')}" ${appDisabled}>${esc(app.action)}</button>
        </div>
      </section>

      <section class="adminFileSection">
        <div class="adminFileHead"><strong>Uploads</strong><span>Photo and resume</span></div>
        <div class="adminUploadGrid">
          ${uploadItem('Candidate Photo', uploads.photo, uploads.appId, 'photo')}
          ${uploadItem('Resume', uploads.resume, uploads.appId, 'resume')}
        </div>
      </section>
    </div>
  </article>`;
}
function uploadItem(title,status,appId,kind){
  const uploaded=status && status!=='Missing';
  return `<div class="adminUploadItem">
    <div>
      <div class="adminUploadTitle">${esc(title)}</div>
      <div class="adminUploadMeta">${uploaded?esc(status):'Not uploaded'}</div>
    </div>
    <div class="adminMiniActions">
      <button type="button" class="adminTiny" ${uploaded?`data-application-id="${esc(appId)}" data-file-kind="${esc(kind)}"`:'disabled'}>${uploaded?'View':'Missing'}</button>
    </div>
  </div>`;
}

function printCurrentApplication(){
  const app = window.currentAdminApplication;
  if(!app){return}
  const a = app.application || {};
  const candidateName = (app.name || a.fullName || 'Candidate').trim();
  const title = `${candidateName} - Discernment Center Application`;
  const safeTitle = title.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  const printWindow = window.open('', '_blank');
  if(!printWindow){
    alert('The print window was blocked. Please allow pop-ups for this site and try again.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${safeTitle}</title>
  <link rel="stylesheet" href="style.css">
  <style>
    @page { size: Letter; margin: 0.45in; }
    html, body {
      background:#fff!important;
      color:#1f2933!important;
      -webkit-print-color-adjust:exact!important;
      print-color-adjust:exact!important;
    }
    body {
      margin:0;
      padding:0;
      font-family:Inter,Arial,Helvetica,sans-serif;
    }
    main {
      width:100%;
      max-width:none;
      margin:0;
      padding:0;
    }
    .actions,.reportPrintActions,button,.noPrint {
      display:none!important;
    }
    .applicationReview,
    .applicationReviewV52 {
      display:block!important;
      width:100%!important;
      max-width:none!important;
      margin:0!important;
      padding:0!important;
      background:#fff!important;
      overflow:visible!important;
    }
    .applicationHeroV52,
    .applicationReviewBlock {
      box-shadow:none!important;
      border:1px solid #d9e2ec!important;
      break-inside:avoid;
      page-break-inside:avoid;
    }
    .applicationHeroV52 {
      padding:22px!important;
      margin-bottom:14px!important;
      grid-template-columns:1fr auto!important;
    }
    .applicationHeroV52 h2 {
      font-size:25px!important;
      line-height:1.1!important;
    }
    .applicationStatusV52 {
      width:96px!important;
      min-width:96px!important;
      min-height:80px!important;
      padding:12px!important;
    }
    .applicationStatusV52 strong {
      font-size:18px!important;
    }
    .applicationReviewGrid {
      grid-template-columns:1fr!important;
      gap:12px!important;
    }
    .applicationReviewBlock {
      padding:14px!important;
      margin-bottom:12px!important;
      border-radius:14px!important;
      overflow:visible!important;
      break-inside:avoid;
      page-break-inside:avoid;
    }
    .applicationReviewBlock h3 {
      font-size:14px!important;
      margin-bottom:8px!important;
    }
    .reviewRow {
      padding:7px 0!important;
      break-inside:avoid;
      page-break-inside:avoid;
    }
    .reviewRow strong {
      font-size:7.5px!important;
    }
    .reviewRow p,
    .reviewRow li {
      font-size:9.2px!important;
      line-height:1.35!important;
    }
  </style>
</head>
<body>
  <main>${applicationHtml(app)}</main>
</body>
</html>`);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 600);
}


function findApplication(id){ return applications.find(app=>String(app.id)===String(id)); }
async function openApplication(id){
  const app=findApplication(id);
  if(!app){return}
  adminReport.classList.remove('hidden');
  adminReport.innerHTML='<p class="muted">Loading application...</p>';
  window.currentAdminApplication=app;

  if(app.hasPhoto && !app.photoUrl){
    try{
      const res=await fetch('/.netlify/functions/application-file',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password, applicationId:app.id, kind:'photo'})});
      const data=await res.json().catch(()=>({}));
      if(res.ok && data.ok && data.url){
        app.photoUrl=data.url;
      }
    }catch(_){}
  }

  adminReport.innerHTML=applicationHtml(app)+`<div class="actions reportPrintActions"><button type="button" onclick="printCurrentApplication()">Print / Save as PDF</button><button type="button" class="secondary" onclick="closeReport()">Close Application</button></div>`;
  window.scrollTo({top:adminReport.offsetTop-10,behavior:'smooth'});
}
function applicationHtml(app){
  const a=app.application||{};
  const fullName=app.name||a.fullName||'Candidate';
  const stateLabel=STATES[a.state]||STATES[app.state]||a.state||app.state||'';
  const regionLabel=a.region||app.region||regionForState(a.state||app.state)||'';
  const contactLine=[a.email||app.email,a.phone||app.phone,[stateLabel,regionLabel?`${regionLabel} Region`:null].filter(Boolean).join(' / ')].filter(Boolean).join(' · ');
  const status=app.status==='submitted'?'Submitted':app.status==='draft'?'Draft':'Application';
  const submittedDate=app.submittedAt||app.updatedAt||'';
  const children=(a.children||[]).map(c=>`<li>${esc(c.name||'')} ${esc(c.age||'')} ${esc(c.sex||'')}</li>`).join('') || '<li>None listed</li>';
  const roles=(a.roles||[]).map(r=>`<li><strong>${esc(r.title||'')}</strong>${r.ministry?` — ${esc(r.ministry)}`:''}${r.years?` (${esc(r.years)})`:''}</li>`).join('') || '<li>None listed</li>';
  const exp=Array.isArray(a.plantingExperience)?a.plantingExperience.join(', '):'';
  const address=cleanAddress(a,stateLabel);
  const debtRows=debtRowsForApplication(a);
  return `<section class="applicationReview applicationReviewV52">
    <div class="applicationHeroV52">
      <div class="applicationHeroIdentityV53">
        ${app.photoUrl ? `<img class="applicationCandidatePhotoV53" src="${esc(app.photoUrl)}" alt="${esc(fullName)} photo">` : `<div class="applicationPhotoPlaceholderV53">${esc(initialsFor(fullName))}</div>`}
        <div>
          <div class="eyebrow">Discernment Center</div>
          <h2>${esc(fullName)} Application</h2>
          <p class="muted">${esc(contactLine)}</p>
        </div>
      </div>
      <div class="applicationStatusV52">
        <strong>${esc(status)}</strong>
        <span>${submittedDate?esc(formatDate(submittedDate)):esc(app.completion?`${app.completion}% Complete`:'')}</span>
      </div>
    </div>

    <div class="applicationReviewGrid">
      ${reviewBlock('Personal Information', [['Full Name',a.fullName],['Date of Birth',a.birthDate],['Email',a.email],['Phone',a.phone],['Address',address],['Citizenship',a.citizenship],['Marital Status',a.maritalStatus]])}
      ${reviewBlock('Spouse and Children', [['Spouse Name',a.spouseName],['Spouse Birth Date',a.spouseBirthDate],['Spouse Marital History',a.spouseMaritalHistory],['Children',`<ul>${children}</ul>`]])}
      ${reviewBlock('Faith and Calling', [['Conversion Story',a.conversionStory],['Call to Ministry',a.callToMinistry]])}
      ${reviewBlock('Ministry Experience', [['Sponsoring Church',a.sponsoringOrg],['Has Sponsor',a.hasSponsor],['License Status',a.licenseStatus],['Planting Experience',exp],['Recent Ministry Roles',`<ul>${roles}</ul>`]])}
      ${reviewBlock('Financial Information', [['Last Year Income',a.lastYearIncome],['Average Income',a.averageIncome],['Bankruptcy',a.bankruptcy], ...(debtRows.length ? debtRows : [['Debt Overview','No debt details listed']])])}
      ${reviewBlock('Church Planting Vision', [['Why Plant',a.whyPlant],['Plant Type',a.plantType],['Target Community',a.targetAudience],['Financial Plan',a.financialPlan],['Plant Timing',a.plantTiming],['Pastor Counsel',a.pastorCounsel],['Pastor Support',a.pastorSupport],['Support Network',a.supportNetwork],['Spouse Involvement',a.spouseInvolvement]])}
      ${reviewBlock('Statement of Faith and Core Convictions', [['Waiver',a.waiverAgreement?'Agreed':'Not checked'],['Statement of Faith',a.statementOfFaith === 'Yes' ? 'In harmony' : a.statementOfFaith === 'No' ? 'Objected' : a.statementOfFaith || 'Not answered'],['Statement Explanation',a.statementFaithExplanation],['Core Convictions',a.coreConvictions?'Read':'Not checked']])}
    </div>
  </section>`;
}
function cleanAddress(a,stateLabel){
  const street = String(a.address || '').trim();
  const city = String(a.city || '').trim();
  const zip = String(a.zip || '').trim();
  const state = String(stateLabel || a.state || '').trim();

  const lowerStreet = street.toLowerCase();
  const cityAlreadyIncluded = city && lowerStreet.includes(city.toLowerCase());
  const stateAlreadyIncluded = state && lowerStreet.includes(state.toLowerCase());

  const parts = [street];
  if(city && !cityAlreadyIncluded) parts.push(city);
  if(state && !stateAlreadyIncluded) parts.push(state);
  if(zip) parts.push(zip);
  return parts.filter(Boolean).join(', ');
}

function debtSummary(a,key){
  const type=a[`debt_${key}_type`]||'';
  const amount=a[`debt_${key}_amount`]||'';
  const interest=a[`debt_${key}_interest`]||'';
  const payment=a[`debt_${key}_payment`]||'';

  const hasAmount = amount && String(amount).trim() !== '0' && String(amount).trim() !== '$0';
  const hasInterest = interest && String(interest).trim() !== '0' && String(interest).trim() !== '0%';
  const hasPayment = payment && String(payment).trim() !== '0' && String(payment).trim() !== '$0';

  if(!hasAmount && !hasInterest && !hasPayment) return '';

  const parts=[
    type,
    hasAmount && `Amount: ${amount}`,
    hasInterest && `Interest: ${interest}`,
    hasPayment && `Payment: ${payment}`
  ].filter(Boolean);

  return parts.join(' · ');
}

function debtRowsForApplication(a){
  return [
    ['School Loans',debtSummary(a,'school')],
    ['Mortgage',debtSummary(a,'mortgage')],
    ['Car Loans',debtSummary(a,'car')],
    ['Credit Card',debtSummary(a,'credit')],
    ['Other Loans',debtSummary(a,'other')]
  ].filter(([,value]) => value);
}

function reviewBlock(title, rows){
  return `<article class="applicationReviewBlock"><h3>${esc(title)}</h3>${rows.map(([k,v])=>`<div class="reviewRow"><strong>${esc(k)}</strong><p>${String(v||'').startsWith('<')?v:esc(v||'—')}</p></div>`).join('')}</article>`;
}
async function openApplicationFile(applicationId, kind){
  try{
    const res=await fetch('/.netlify/functions/application-file',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password, applicationId, kind})});
    const data=await res.json().catch(()=>({}));
    if(!res.ok||!data.ok) throw new Error(data.error||'Could not open file.');
    window.open(data.url, '_blank');
  }catch(err){
    alert(err.message||'Could not open file.');
  }
}

initAdmin();
function isaReportHtml(record){
  const c=record.candidate||{};
  const s=record.scores||{};
  const cats=s.categories||[];
  const pct=s.overall||record.overall||0;
  return `<div class="isaReport isaReportV44">
    <div class="isaReportTitle isaReportHeroV44">
      <div>
        <div class="eyebrow">Ministry Readiness Inventory</div>
        <h2>${esc(c.name||'Candidate')} ISA-Style Score</h2>
        <p class="muted">${esc(c.email||'')} · ${esc(c.phone||'')} · ${esc(c.state||'')} / ${esc(c.region||regionForState(c.state)||'')} Region</p>
      </div>
      <div class="isaOverall" style="border-color:${scoreColor(pct)}"><strong>${esc(pct)}%</strong><span>${esc(s.overallLabel||record.overallLabel||'')}</span></div>
    </div>
    <div class="isaScoreStripV44">${cats.map(isaScoreCard).join('')}</div>
    ${isaHowToReadHtml()}
    ${isaComparisonTable(cats, c)}
    ${isaCandidateSuggestion(cats, c)}
    <section class="reportSection isaReportBlock"><h3>Category Interpretation</h3><div class="isaCategoryCards">${cats.map(cat=>`<article class="isaCategoryCard"><div class="isaCategoryAccent" style="background:${barColor(cat.score)}"></div><div><h4>${esc(cat.name)} <span>${esc(cat.score)}% · ${esc(cat.label)}</span></h4><p>${esc(cat.description||'')}</p><small>Benchmark ${esc(cat.benchmark)}% · Median ${esc(cat.median)}%</small></div></article>`).join('')}</div></section>
    ${isaInDepth(record.answers||{}, c)}
  </div>`;
}

