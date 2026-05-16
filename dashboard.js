(async function(){
 dcAuth.setupLogout(); const user=await dcAuth.requireUser(); if(!user)return;
 const sb=await dcAuth.getSupabaseClient();
 const profile=await dcAuth.getProfile(user.id).catch(()=>null);
 document.getElementById('welcomeTitle').textContent=`Welcome${profile?.full_name?`, ${profile.full_name}`:''}`;
 const {data,error}=await sb.from('assessment_results').select('id,created_at,candidate,scores,state,region,overall,overall_label,email_sent').eq('user_id',user.id).order('created_at',{ascending:false});
 const list=document.getElementById('reportsList');
 if(error){list.innerHTML=`<p class="warningText">${error.message}</p>`;return}
 if(!data||!data.length){list.innerHTML='<p class="muted">No completed reports yet.</p>';return}
 list.innerHTML=data.map(r=>`<div class="reportListItem"><div><strong>Character Qualities Assessment</strong><p class="muted">${new Date(r.created_at).toLocaleString()} · ${r.state||''} · ${r.region||''} Region</p></div><div class="scoreBadge"><strong>${r.overall||r.scores?.overall||''}</strong><span>${r.overall_label||r.scores?.overallLabel||''}</span></div><a class="buttonLink secondary" href="report.html?id=${encodeURIComponent(r.id)}">View Report</a></div>`).join('')
})();
