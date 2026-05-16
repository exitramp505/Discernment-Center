(async function(){
 const form=document.getElementById('loginForm'); const msg=document.getElementById('authMessage');
 form.addEventListener('submit',async e=>{
  e.preventDefault(); msg.textContent='Logging in...';
  const fd=new FormData(form);
  try{const sb=await dcAuth.getSupabaseClient(); const {error}=await sb.auth.signInWithPassword({email:fd.get('email'),password:fd.get('password')}); if(error) throw error; window.location.href='dashboard.html'}
  catch(err){msg.textContent=err.message||'Could not log in.'}
 });
})();
