(async function(){
 dcAuth.setupLogout(); dcAuth.fillStateSelect(document.getElementById('state'));
 const user=await dcAuth.requireUser(); if(!user)return;
 const form=document.getElementById('profileForm'); const msg=document.getElementById('profileMessage');
 const profile=await dcAuth.getProfile(user.id).catch(()=>null);
 form.email.value=user.email||'';
 if(profile){form.name.value=profile.full_name||'';form.phone.value=profile.phone||'';form.state.value=profile.state||'';form.married.value=profile.married||''}
 form.addEventListener('submit',async e=>{e.preventDefault(); msg.textContent='Saving...'; const fd=new FormData(form); try{await dcAuth.upsertProfile({id:user.id,full_name:fd.get('name'),email:user.email,phone:fd.get('phone'),state:fd.get('state'),region:dcAuth.regionForState(fd.get('state')),married:fd.get('married')}); msg.textContent='Profile saved.'}catch(err){msg.textContent=err.message||'Could not save profile.'}});
})();
