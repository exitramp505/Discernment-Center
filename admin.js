
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

let password='';
let submissions=[];

function initAdmin(){
  stateFilter.innerHTML='<option value="">All states</option>'+Object.entries(STATES).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
  password=sessionStorage.getItem('dc_admin_password')||'';
  if(password){adminPassword.value=password;loadSubmissions();}
  loginBtn.addEventListener('click',()=>{password=adminPassword.value.trim();sessionStorage.setItem('dc_admin_password',password);loadSubmissions();});
  refreshBtn.addEventListener('click',loadSubmissions);
  logoutBtn.addEventListener('click',()=>{sessionStorage.removeItem('dc_admin_password');password='';dashboard.classList.add('hidden');loginCard.classList.remove('hidden');adminPassword.value='';});
  searchInput.addEventListener('input',renderList);
  stateFilter.addEventListener('change',renderList);
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
    loginCard.classList.add('hidden');
    dashboard.classList.remove('hidden');
    adminReport.classList.add('hidden');
    loginMessage.textContent='';
    renderList();
  }catch(err){
    loginMessage.textContent=err.message;
    dashboard.classList.add('hidden');
    loginCard.classList.remove('hidden');
  }
}

function renderList(){
  let rows=[...submissions];
  const q=(searchInput.value||'').toLowerCase().trim();
  const st=stateFilter.value;
  if(q){
    rows=rows.filter(r=>`${r.name} ${r.email} ${r.phone} ${r.state} ${STATES[r.state]||''} ${r.overallLabel}`.toLowerCase().includes(q));
  }
  if(st) rows=rows.filter(r=>r.state===st);
  const sort=sortSelect.value;
  rows.sort((a,b)=>{
    if(sort==='oldest') return new Date(a.submittedAt||0)-new Date(b.submittedAt||0);
    if(sort==='highest') return Number(b.overall||0)-Number(a.overall||0);
    if(sort==='lowest') return Number(a.overall||0)-Number(b.overall||0);
    if(sort==='name') return String(a.name||'').localeCompare(String(b.name||''));
    return new Date(b.submittedAt||0)-new Date(a.submittedAt||0);
  });
  countLine.textContent=`Showing ${rows.length} of ${submissions.length} stored submission${submissions.length===1?'':'s'}.`;
  if(!rows.length){submissionsList.innerHTML='<div class="card"><p class="muted">No submissions found.</p></div>';return;}
  submissionsList.innerHTML=rows.map(r=>card(r)).join('');
  document.querySelectorAll('[data-open-report]').forEach(btn=>btn.addEventListener('click',()=>openReport(btn.dataset.openReport)));
}

function card(r){
  const date=r.submittedAt?new Date(r.submittedAt).toLocaleString():'Unknown date';
  const top=(r.top||[]).map(x=>x.name).join(', ')||'None listed';
  const growth=(r.growth||[]).map(x=>x.name).join(', ')||'None listed';
  return `<div class="card submissionCard">
    <div class="submissionTop">
      <div>
        <h3>${esc(r.name||'Unnamed Candidate')}</h3>
        <p class="muted">${esc(date)} · ${esc(STATES[r.state]||r.state||'No state')}</p>
      </div>
      <div class="scoreBadge"><strong>${esc(r.overall||'')}</strong><span>${esc(r.overallLabel||'')}</span></div>
    </div>
    <div class="submissionMeta">
      <span>${esc(r.email||'')}</span>
      <span>${esc(r.phone||'')}</span>
      <span>Married: ${esc(r.married||'')}</span>
      <span>Email: ${r.emailSent?'Sent':'Not sent'}</span>
    </div>
    ${r.emailError?`<p class="warningText"><strong>Email Error:</strong> ${esc(r.emailError)}</p>`:''}
    <button type="button" data-open-report="${esc(r.id)}">Open Full Report</button>
  </div>`;
}

async function openReport(id){
  adminReport.classList.remove('hidden');
  adminReport.innerHTML='<p class="muted">Loading report...</p>';
  try{
    const data=await adminFetch({id});
    adminReport.innerHTML=reportHtml(data.submission)+`<div class="actions"><button onclick="window.print()">Print or Save PDF</button></div>`;
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
function reportHtml(record){
  const c=record.candidate||{};
  const s=record.scores||{};
  const r=record.reflections||{};
  return `<h2>Discernment Center Candidate Assessment Report</h2>
  <div class="reportMeta"><p><strong>Submission ID:</strong> ${esc(record.id||'')}<br>
  <strong>Submitted:</strong> ${esc(record.submittedAt?new Date(record.submittedAt).toLocaleString():'')}<br>
  <strong>Candidate:</strong> ${esc(c.name||'')}<br>
  <strong>Email:</strong> ${esc(c.email||'')}<br>
  <strong>Phone:</strong> ${esc(c.phone||'')}<br>
  <strong>State:</strong> ${esc(STATES[c.state]||c.state||'')}<br>
  <strong>Married:</strong> ${esc(c.married||'')}<br>
  <strong>Routed Leader:</strong> ${esc(record.routedLeader||'')}<br>
  <strong>Email Status:</strong> ${record.emailSent?'Sent':'Not sent'}</p><div class="overallCard"><span>Overall Readiness</span><strong>${esc(s.overall||'')}</strong><em>${esc(s.overallLabel||'')}</em></div></div>
  ${characterQualityIntro()}
  ${visualScoreChart(s.results||[])}
  ${characterQualityDefinitions(s.results||[])}`;
}

function esc(value){return String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}

initAdmin();
