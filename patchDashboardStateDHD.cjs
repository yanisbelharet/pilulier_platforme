const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const stateAddition = `
  const [dhdFilter, setDhdFilter] = useState('pending');
  const [dhdSearch, setDhdSearch] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
`;

content = content.replace(
  "const [editingProduct, setEditingProduct] = useState<any>(null);",
  "const [editingProduct, setEditingProduct] = useState<any>(null);" + stateAddition
);

fs.writeFileSync('src/Dashboard.tsx', content);
