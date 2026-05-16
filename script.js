const STATES={AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming'};
const SCALE=['Not Yet Evident','Emerging','Evident','Strongly Evident','Exceptionally Evident'];
const sections=[
['Resilience',['I recover well after setbacks or disappointments.','I remain steady under pressure.','I can continue leading when progress is slow.','I respond constructively to criticism.','I stay faithful to commitments during difficult seasons.']],
['Spousal Cooperation',['My spouse supports my sense of calling and ministry direction.','My spouse and I communicate openly about ministry expectations.','My spouse understands the sacrifices involved in ministry leadership.','We make ministry decisions together with unity.','My spouse is willing to participate appropriately in the discernment process.'],true],
['Financial Responsibility',['I manage personal finances with discipline and integrity.','I avoid unnecessary debt and financial impulsiveness.','I can live within a realistic ministry budget.','I handle money transparently and ethically.','My financial habits would not hinder ministry credibility.']],
['Builds Group Cohesiveness',['I help people work together toward a shared purpose.','I address conflict in ways that preserve unity.','I create environments where people feel included.','I encourage collaboration rather than competition.','I help groups regain focus when they become divided or distracted.']],
['Effectively Builds Relationships',['I initiate meaningful relationships with new people.','I listen well and remember what matters to others.','I build trust over time through consistency.','I relate well across personality differences.','I follow up with people in ways that strengthen connection.']],
['Flexible and Adaptable',['I adjust plans when circumstances change.','I can lead effectively in uncertain or ambiguous situations.','I receive new ideas without becoming defensive.','I can change methods without losing sight of mission.','I handle interruptions and unexpected demands with maturity.']],
['Exercises Faith',['I make decisions with prayerful dependence on God.','I trust God when outcomes are not yet visible.','I take obedient steps even when success is not guaranteed.','I encourage others to believe God for growth and transformation.','My leadership is marked by spiritual confidence rather than fear.']],
['Cultural Agility',['I seek to understand people whose backgrounds differ from mine.','I adapt communication to fit different cultural contexts.','I avoid assuming that my preferences are universal.','I can learn from communities that are unlike my own.','I value diversity within the body of Christ.']],
['Visionizing Capacity',['I can describe a compelling picture of a preferred future.','I help others see possibilities beyond current limitations.','I connect present actions to long-term mission.','I communicate vision in ways that inspire participation.','I can translate vision into practical next steps.']],
['Utilizes Giftedness of Others',['I notice the gifts and strengths of people around me.','I invite others to serve in areas that fit their abilities.','I delegate responsibility rather than trying to do everything myself.','I develop emerging leaders intentionally.','I celebrate others contributions publicly and sincerely.']],
['Relates to the Lost and Unchurched',['I build genuine friendships with people who are not connected to church.','I can talk about faith naturally without being pushy.','I understand questions and concerns unchurched people may have.','I prioritize ministry beyond existing church insiders.','I look for ways to create welcoming environments for spiritual seekers.']],
['Responsive to Community',['I pay attention to the real needs of the surrounding community.','I listen to community voices before creating ministry plans.','I can identify practical ways the church can serve locally.','I value partnerships with community organizations where appropriate.','I believe ministry should bless the neighborhood, not just the congregation.']],
['Creates Ministry Ownership',['I help people move from attendance to active participation.','I invite others to take responsibility for ministry outcomes.','I equip teams rather than simply assigning tasks.','I communicate why each persons contribution matters.','I build systems that allow ministry to continue without depending only on me.']],
['Committed to Kingdom Growth',['I care about growth in discipleship, outreach, and multiplication.','I celebrate ministry fruit beyond my own organization or church.','I am willing to make sacrifices for Kingdom impact.','I think strategically about reaching more people for Christ.','I measure success by faithfulness, transformation, and mission advancement.']],
['Intrinsically Motivated',['I take initiative without needing constant external pressure.','I remain motivated by calling rather than recognition.','I follow through on responsibilities even when no one is watching.','I pursue growth because I want to become more faithful and effective.','I sustain effort over time from internal conviction.']]
];
function interpretation(s){if(s===null)return'N/A';if(s<2)return'Not Yet Evident';if(s<3)return'Emerging';if(s<3.8)return'Evident';if(s<4.5)return'Strongly Evident';return'Exceptionally Evident'}
let currentIndex=0;
let currentItems=[];
let answers={};
function init(){state.innerHTML='<option value="">Select state</option>'+Object.entries(STATES).map(([k,v])=>`<option value="${k}">${v}</option>`).join(''); renderQuestions(); married.addEventListener('change',()=>{answers={};currentIndex=0;renderQuestions()}); assessmentForm.addEventListener('submit',submit)}
function orderedQuestions(marriedYes){
 const items=[];
 sections.forEach((s,si)=>{if(s[2]&&!marriedYes)return; s[1].forEach((q,qi)=>items.push({si,qi,q,name:`q_${si}_${qi}`}))});
 const interleaved=[];
 for(let qi=0;qi<5;qi++){sections.forEach((s,si)=>{if(s[2]&&!marriedYes)return; interleaved.push(...items.filter(x=>x.si===si&&x.qi===qi))})}
 return interleaved;
}
function candidateReady(){return assessmentForm.name.value.trim()&&assessmentForm.email.value.trim()&&assessmentForm.phone.value.trim()&&state.value&&married.value}
function renderQuestions(){const marriedYes=married.value==='Yes';currentItems=orderedQuestions(marriedYes);reflectionCard.classList.add('hidden');document.getElementById('generateReportBtn').classList.add('hidden');const spouseNote=married.value==='No'?`<div class="card note"><h2>Marriage Related Questions</h2><p class="muted">Because you selected that you are not married, the Spousal Cooperation category will appear as N/A in the final report and will not affect the overall score.</p></div>`:'';
 if(!candidateReady()){questions.innerHTML=spouseNote+`<div class="card"><h2>Assessment Questions</h2><p class="muted">Complete the candidate information above to begin the one-question-at-a-time assessment.</p></div>`;return}
 if(currentIndex>=currentItems.length){showReflectionStep();return}
 const item=currentItems[currentIndex];const answered=answers[item.name];const pct=Math.round((currentIndex/currentItems.length)*100);
 const tone=['toneOne','toneTwo','toneThree'][currentIndex%3];questions.innerHTML=spouseNote+`<div class="card assessmentShell ${tone}"><h2>Assessment Questions</h2><p class="muted">Each question appears one at a time. Choose the answer that is most currently evident. If you go back to review a question, you can click the same answer again to continue.</p><div class="progressWrap"><div class="progressMeta"><span>Question ${currentIndex+1} of ${currentItems.length}</span><span>${pct}% complete</span></div><div class="progressTrack"><div class="progressBar" style="width:${pct}%"></div></div></div><div class="questionSlide"><div class="questionText"><span class="qnum">${currentIndex+1}</span><strong>${item.q}</strong></div><div class="scale slideScale">${SCALE.map((lab,i)=>`<label class="${answered==i+1?'selected':''}"><input type="radio" name="${item.name}" value="${i+1}" ${answered==i+1?'checked':''}><span class="scaleNum">${i+1}</span><span>${lab}</span></label>`).join('')}</div></div><div class="slideActions"><button type="button" class="secondaryBtn" onclick="prevQuestion()" ${currentIndex===0?'disabled':''}>Previous Question</button><span class="muted">${answered?'Answered':'Select an answer to continue'}</span></div></div>`;
 let isAdvancing=false;
 document.querySelectorAll('.slideScale label').forEach(label=>label.addEventListener('click',e=>{
  e.preventDefault();
  if(isAdvancing)return;
  isAdvancing=true;
  const input=label.querySelector('input');
  answers[item.name]=Number(input.value);
  document.querySelectorAll('.slideScale label').forEach(l=>l.classList.remove('selected'));
  label.classList.add('selected');
  input.checked=true;
  const shell=document.querySelector('.assessmentShell');
  if(shell){shell.classList.add('answeredFlash')}
  setTimeout(()=>{currentIndex++;renderQuestions()},300)
 }));
}
function prevQuestion(){if(currentIndex>0){currentIndex--;renderQuestions()}}
function showReflectionStep(){const pct=100;const missing=missingItems();
 if(missing.length){currentIndex=currentItems.findIndex(item=>item.name===missing[0].name);renderQuestions();showMessage('One assessment question still needs an answer. I moved you back to it.','warning');return}
 document.getElementById('generateReportBtn').classList.remove('hidden');questions.innerHTML=`<div class="card assessmentShell"><h2>Assessment Complete</h2><div class="progressWrap"><div class="progressMeta"><span>Assessment questions complete</span><span>${pct}% complete</span></div><div class="progressTrack"><div class="progressBar" style="width:100%"></div></div></div><p class="muted">All required assessment questions have been answered. Complete the reflection questions below, then generate the report. Use Previous Question if you need to review your final answer.</p><div class="slideActions"><button type="button" class="secondaryBtn" onclick="prevQuestion()">Previous Question</button></div></div>`;reflectionCard.classList.remove('hidden')}

function calc(){const marriedYes=married.value==='Yes';let results=[];sections.forEach((s,si)=>{if(s[2]&&!marriedYes){results.push({name:s[0],score:null,label:'N/A'});return}let vals=s[1].map((_,qi)=>Number(answers[`q_${si}_${qi}`]||0));let avg=vals.reduce((a,b)=>a+b,0)/vals.length;results.push({name:s[0],score:+avg.toFixed(2),label:interpretation(avg)})});const scored=results.filter(r=>r.score!==null);const overall=+(scored.reduce((a,b)=>a+b.score,0)/scored.length).toFixed(2);return {results,overall,overallLabel:interpretation(overall),top:[...scored].sort((a,b)=>b.score-a.score).slice(0,3),growth:[...scored].sort((a,b)=>a.score-b.score).slice(0,3)}}
function missingItems(){return currentItems.filter(item=>!answers[item.name])}
function submit(e){
 e.preventDefault();
 if(!candidateReady()){
  showMessage('Please complete the candidate information first.');
  return;
 }
 const missing=missingItems();
 if(missing.length){
  currentIndex=currentItems.findIndex(item=>item.name===missing[0].name);
  renderQuestions();
  showMessage(`One assessment question still needs an answer. I moved you back to it.`, 'warning');
  window.scrollTo({top:questions.offsetTop-12,behavior:'smooth'});
  return;
 }
 const fd=new FormData(assessmentForm);
 const candidate=Object.fromEntries(fd.entries());
 const scores=calc();
 const html=reportHtml(candidate,scores);
 window.currentReport={candidate,scores,answers,reflections:{strengths:fd.get('strengths'),growth:fd.get('growth'),concerns:fd.get('concerns'),other:fd.get('other')}};
 report.innerHTML=html+`<div class="actions"><button onclick="window.print()">Print or Save PDF</button></div><div id="sendStatus" class="sendStatus">Sending and storing report...</div>`;
 report.classList.remove('hidden');
 window.scrollTo({top:report.offsetTop,behavior:'smooth'});
 sendReport();
}
function showMessage(text,type='info'){
 let box=document.getElementById('statusMessage');
 if(!box){box=document.createElement('div');box.id='statusMessage';assessmentForm.insertBefore(box,questions)}
 box.className=`statusMessage ${type}`;
 box.textContent=text;
 box.classList.remove('hidden');
 setTimeout(()=>box.classList.add('hidden'),4200);
}
function reportHtml(c,s){return `<h2>Discernment Center Candidate Assessment Report</h2><p><strong>Candidate:</strong> ${c.name}<br><strong>Email:</strong> ${c.email}<br><strong>Phone:</strong> ${c.phone}<br><strong>State:</strong> ${STATES[c.state]}<br><strong>Married:</strong> ${c.married}<br><strong>Date:</strong> ${new Date().toLocaleDateString()}</p><h3>Overall Readiness: ${s.overall} out of 5 — ${s.overallLabel}</h3><h3>Category Scores</h3><table><tr><th>Character Quality</th><th>Score</th><th>Interpretation</th></tr>${s.results.map(r=>`<tr><td>${r.name}</td><td>${r.score??'N/A'}</td><td>${r.label}</td></tr>`).join('')}</table><h3>Strongest Areas</h3><p>${s.top.map(r=>`<span class="pill">${r.name}: ${r.score}</span>`).join('')}</p><h3>Primary Growth Areas</h3><p>${s.growth.map(r=>`<span class="pill">${r.name}: ${r.score}</span>`).join('')}</p><h3>Reflection Responses</h3><p><strong>Strengths:</strong> ${c.strengths||''}</p><p><strong>Development Areas:</strong> ${c.growth||''}</p><p><strong>Concerns/Questions:</strong> ${c.concerns||''}</p><p><strong>Other:</strong> ${c.other||''}</p>`}

async function sendReport(){
 const status=document.getElementById('sendStatus');
 if(status){status.className='sendStatus pending';status.textContent='Sending and storing report...'}
 try{
  const res=await fetch('/.netlify/functions/submit-assessment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(window.currentReport)});
  const data=await res.json().catch(()=>({}));
  if(res.ok&&data.ok){
   if(status){status.className='sendStatus success';status.textContent='Report emailed and stored successfully.'}
  }else{
   if(status){status.className='sendStatus error';status.textContent=data.error||'Report could not be emailed or stored. Check Netlify environment variables.'}
  }
 }catch(err){
  if(status){status.className='sendStatus error';status.textContent='Report could not be emailed or stored. Check your Netlify function setup.'}
 }
}
init();
