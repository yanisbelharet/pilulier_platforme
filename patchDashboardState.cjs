const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

content = content.replace(
  `  const [activeTab, setActiveTab] = useState('overview');\n  const [dateFilter, setDateFilter] = useState('all');`,
  `  const [activeTab, setActiveTab] = useState('overview');\n  const [dateFilter, setDateFilter] = useState('all');\n  const [editingProduct, setEditingProduct] = useState<any>(null);`
);

fs.writeFileSync('src/Dashboard.tsx', content);
