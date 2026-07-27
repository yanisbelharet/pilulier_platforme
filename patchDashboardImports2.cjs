const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

content = content.replace(
  "import { Lock, Settings, Save, LogOut, TrendingUp, Users, ShoppingCart, ShoppingBag, Tag, Eye, Package, DollarSign, LayoutDashboard, BarChart3, Bell, Clock } from 'lucide-react';",
  "import { Lock, Settings, Save, LogOut, TrendingUp, Users, ShoppingCart, ShoppingBag, Tag, Eye, Package, DollarSign, LayoutDashboard, BarChart3, Bell, Clock, Plane, Phone, CheckCircle, XCircle, Search, RefreshCw, AlertCircle } from 'lucide-react';"
);

fs.writeFileSync('src/Dashboard.tsx', content);
