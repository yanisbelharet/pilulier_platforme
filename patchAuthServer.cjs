const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldAuthMiddleware = `function authMiddleware(req: any, res: any, next: any) {
  const token = req.cookies.admin_token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}`;

const newAuthMiddleware = `function authMiddleware(req: any, res: any, next: any) {
  let token = req.cookies.admin_token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}`;

content = content.replace(oldAuthMiddleware, newAuthMiddleware);

const oldLogin = `      res.cookie('admin_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ success: true });`;

const newLogin = `      res.cookie('admin_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ success: true, token });`;

content = content.replace(oldLogin, newLogin);

fs.writeFileSync('server.ts', content);
