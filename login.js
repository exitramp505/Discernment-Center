(async function(){
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('authMessage');
  const googleBtn = document.getElementById('googleLoginBtn');

  function setMessage(text, type){
    if(!msg) return;
    msg.textContent = text || '';
    msg.classList.remove('success','error');
    if(type) msg.classList.add(type);
  }

  function loginRedirectTo(){
    return `${window.location.origin}/dashboard.html`;
  }

  async function signInWithGoogle(){
    setMessage('Redirecting to Google...');
    try{
      const sb = await dcAuth.getSupabaseClient();
      const { error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: loginRedirectTo() }
      });
      if(error) throw error;
    }catch(err){
      setMessage(err.message || 'Could not continue with Google.', 'error');
    }
  }

  if(googleBtn) googleBtn.addEventListener('click', signInWithGoogle);

  if(form){
    form.addEventListener('submit', async e => {
      e.preventDefault();
      setMessage('Logging in...');
      const fd = new FormData(form);

      try{
        const sb = await dcAuth.getSupabaseClient();
        const { error } = await sb.auth.signInWithPassword({
          email: fd.get('email'),
          password: fd.get('password')
        });
        if(error) throw error;
        window.location.href = 'dashboard.html';
      }catch(err){
        setMessage(err.message || 'Could not log in.', 'error');
      }
    });
  }
})();
