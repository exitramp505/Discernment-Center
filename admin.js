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
    <p><strong>Strongest:</strong> ${esc(top)}</p>
    <p><strong>Growth Areas:</strong> ${esc(growth)}</p>
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

function reportHtml(record){
  const c=record.candidate||{};
  const s=record.scores||{};
  const r=record.reflections||{};
  return `<h2>Discernment Center Candidate Assessment Report</h2>
  <p><strong>Submission ID:</strong> ${esc(record.id||'')}<br>
  <strong>Submitted:</strong> ${esc(record.submittedAt?new Date(record.submittedAt).toLocaleString():'')}<br>
  <strong>Candidate:</strong> ${esc(c.name||'')}<br>
  <strong>Email:</strong> ${esc(c.email||'')}<br>
  <strong>Phone:</strong> ${esc(c.phone||'')}<br>
  <strong>State:</strong> ${esc(STATES[c.state]||c.state||'')}<br>
  <strong>Married:</strong> ${esc(c.married||'')}<br>
  <strong>Routed Leader:</strong> ${esc(record.routedLeader||'')}<br>
  <strong>Email Status:</strong> ${record.emailSent?'Sent':'Not sent'}</p>
  <h3>Overall Readiness: ${esc(s.overall||'')} out of 5 — ${esc(s.overallLabel||'')}</h3>
  <h3>Category Scores</h3>
  <table><tr><th>Character Quality</th><th>Score</th><th>Interpretation</th></tr>${(s.results||[]).map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.score??'N/A')}</td><td>${esc(x.label)}</td></tr>`).join('')}</table>
  <h3>Strongest Areas</h3><p>${(s.top||[]).map(x=>`<span class="pill">${esc(x.name)}: ${esc(x.score)}</span>`).join('')}</p>
  <h3>Primary Growth Areas</h3><p>${(s.growth||[]).map(x=>`<span class="pill">${esc(x.name)}: ${esc(x.score)}</span>`).join('')}</p>
  <h3>Reflection Responses</h3>
  <p><strong>Strengths:</strong> ${esc(r.strengths||c.strengths||'')}</p>
  <p><strong>Development Areas:</strong> ${esc(r.growth||c.growth||'')}</p>
  <p><strong>Concerns/Questions:</strong> ${esc(r.concerns||c.concerns||'')}</p>
  <p><strong>Other:</strong> ${esc(r.other||c.other||'')}</p>`;
}

function esc(value){return String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}

initAdmin();
