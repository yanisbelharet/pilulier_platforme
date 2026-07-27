const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const oldPushBody = `            Total: order.price,
            TProduit: (() => {`;

const newPushBody = `            Total: order.price,
            Note: order.note || '',
            TProduit: (() => {`;

content = content.replace(oldPushBody, newPushBody);

fs.writeFileSync('src/Dashboard.tsx', content);
