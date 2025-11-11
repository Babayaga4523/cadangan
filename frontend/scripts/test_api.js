(async ()=>{
  try {
    const login = await fetch('http://127.0.0.1:8000/api/login', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@cbt.com', password: 'admin123' })
    });
    console.log('LOGIN STATUS', login.status);
    const loginText = await login.text();
    console.log(loginText);
    const parsed = JSON.parse(loginText);
    const token = parsed.token || parsed.access_token || (parsed.data && parsed.data.access_token);
    console.log('TOKEN', token);
    if (!token) return;

    const res = await fetch('http://127.0.0.1:8000/api/tests/1', {
      headers: { 'Accept': 'application/json', 'Authorization': 'Bearer ' + token }
    });
    console.log('/api/tests/1 status', res.status);
    console.log(await res.text());
  } catch (e) {
    console.error(e);
  }
})();
