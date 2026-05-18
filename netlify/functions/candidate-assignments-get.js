const { createClient } = require('@supabase/supabase-js');

function json(status, body){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }; }

exports.handler = async (event) => {
  if(event.httpMethod !== 'GET') return json(405,{ok:false,error:'Method not allowed'});
  try{
    const auth = event.headers.authorization || event.headers.Authorization || '';
    const token = auth.replace(/^Bearer\s+/i,'');
    if(!token) return json(401,{ok:false,error:'Missing authorization token.'});

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data:userData, error:userError } = await supabase.auth.getUser(token);
    if(userError || !userData?.user) return json(401,{ok:false,error:'Invalid session.'});

    const { data, error } = await supabase
      .from('candidate_assignments')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('status','assigned')
      .order('created_at',{ascending:true});

    if(error) throw error;
    return json(200,{ok:true,assignments:data||[]});
  }catch(err){
    return json(500,{ok:false,error:err.message||'Could not load assignments.'});
  }
};
