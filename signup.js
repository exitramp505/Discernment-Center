(async function(){
 dcAuth.fillStateSelect(document.getElementById('state'));
 const form=document.getElementById('signupForm');
 const msg=document.getElementById('authMessage');
 form.addEventListener('submit',async e=>{
  e.preventDefault(); msg.textContent='Creating account...';
  const fd=new FormData(form); const fullName=fd.get('name').trim(); const email=fd.get('email').trim();
  try{
   const sb=await dcAuth.getSupabaseClient();
   const {data,error}=await sb.auth.signUp({email,password:fd.get('password'),options:{data:{full_name:fullName}}});
   if(error) throw error;
   if(data.user){
    await dcAuth.upsertProfile({id:data.user.id,full_name:fullName,email,phone:fd.get('phone'),state:fd.get('state'),region:dcAuth.regionForState(fd.get('state')),married:fd.get('married')});
   }
   msg.textContent='Account created. If email confirmation is enabled, check your email. Redirecting...';
   setTimeout(()=>{window.location.href='dashboard.html'},900);
  }catch(err){msg.textContent=err.message||'Could not create account.'}
 });
})();
