const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const oldUseEffect = `  useEffect(() => {
    // Check if we can fetch config to verify authentication
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
      });
      
    fetch('/api/orders')
      .then(res => {
        if(res.ok) {
           setIsAuthenticated(true);
           return res.json();
        }
        return [];
      })
      .then(data => {
         if (data && data.length) setOrders(data);
      }).catch(() => {});
  }, [isAuthenticated]);`;

const newUseEffect = `  const fetchAuth = (url: string, options: any = {}) => {
    const token = localStorage.getItem('admin_token');
    const headers = { ...options.headers };
    if (token) {
      headers['Authorization'] = \`Bearer \${token}\`;
    }
    return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    // Check if we can fetch config to verify authentication
    fetchAuth('/api/config')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
      });
      
    fetchAuth('/api/orders')
      .then(res => {
        if(res.ok) {
           setIsAuthenticated(true);
           return res.json();
        }
        return [];
      })
      .then(data => {
         if (data && data.length) setOrders(data);
      }).catch(() => {});
  }, [isAuthenticated]);`;

content = content.replace(oldUseEffect, newUseEffect);

const oldLogin = `      if (res.ok) {
        setIsAuthenticated(true);
      } else {`;
const newLogin = `      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('admin_token', data.token);
        }
        setIsAuthenticated(true);
      } else {`;
content = content.replace(oldLogin, newLogin);

const oldLogout = `  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
  };`;
const newLogout = `  const handleLogout = async () => {
    await fetchAuth('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };`;
content = content.replace(oldLogout, newLogout);

const oldHandleSave = `      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });`;
const newHandleSave = `      const res = await fetchAuth('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });`;
content = content.replace(oldHandleSave, newHandleSave);

fs.writeFileSync('src/Dashboard.tsx', content);
