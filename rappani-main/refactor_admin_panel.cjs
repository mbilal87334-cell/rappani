const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize newlines for searching
const normalizedContent = content.replace(/\r\n/g, '\n');

const startStr = '  return (\n    <div className="min-h-screen bg-zinc-800/50 pb-12">';
const endStr = 'export default function App() {';

const startIndex = normalizedContent.indexOf(startStr);
const endIndex = normalizedContent.lastIndexOf('  );\n}', normalizedContent.indexOf(endStr));

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find boundaries.");
  process.exit(1);
}

const oldReturnBlock = normalizedContent.slice(startIndex, endIndex + 5);

// Extract WhatsApp
const whatsappStart = oldReturnBlock.indexOf('{/* WhatsApp Management */}');
const whatsappEnd = oldReturnBlock.indexOf('{/* UPI Management */}');
const whatsappBlock = oldReturnBlock.substring(whatsappStart, whatsappEnd);

// Extract UPI
const upiStart = whatsappEnd;
const upiEnd = oldReturnBlock.indexOf('{showPasswordChange && (');
const upiBlock = oldReturnBlock.substring(upiStart, upiEnd);

// Extract Security
const securityStart = oldReturnBlock.indexOf('{showPasswordChange && (');
const securityEnd = oldReturnBlock.indexOf('{formError && (', securityStart);
const securityStr = oldReturnBlock.substring(securityStart, securityEnd);
let securityBlock = securityStr.replace('{showPasswordChange && (', '');
securityBlock = securityBlock.substring(0, securityBlock.lastIndexOf(')}'));

// Extract Products Tab
const productsStart = oldReturnBlock.indexOf("{adminTab === 'products' ? (");
const productsContentStart = oldReturnBlock.indexOf('<div className="grid lg:grid-cols-3 gap-8 items-start">', productsStart);
const ordersStart = oldReturnBlock.indexOf(') : (', productsContentStart);
let productsBlock = oldReturnBlock.substring(productsContentStart, ordersStart);
// remove closing parenthesis if any
productsBlock = productsBlock.replace(/\)\s*$/, '');


// Extract Orders Tab
const ordersContentStart = oldReturnBlock.indexOf('<div className="space-y-6">', ordersStart);
const ordersEnd = oldReturnBlock.lastIndexOf('</main>');
let ordersBlock = oldReturnBlock.substring(ordersContentStart, ordersEnd);
ordersBlock = ordersBlock.trim().replace(/\)\}$/, '');


// Extract Location Image
const locationStart = oldReturnBlock.indexOf('<div className="bg-zinc-900/40 glass p-6 rounded-2xl shadow-sm border border-white/10 flex items-center justify-between gap-4">', 0);
const locationEnd = oldReturnBlock.indexOf('<div className="bg-zinc-900/40 glass p-6 rounded-2xl shadow-sm border border-white/10 flex items-center justify-between gap-4">', locationStart + 10);
const locationImageBlock = oldReturnBlock.substring(locationStart, locationEnd);

// Extract Welcome Banner
const heroStart = locationEnd;
const heroRealEnd = oldReturnBlock.indexOf('</div>\n        </div>\n\n        {/* WhatsApp Management', heroStart);
const heroImageBlock = oldReturnBlock.substring(heroStart, heroRealEnd);


const newReturnBlock = `  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-zinc-900 border-b md:border-b-0 md:border-r border-white/5 flex flex-col z-20">
        <div className="p-4 md:p-6 flex items-center justify-between md:justify-start">
          <div className="flex items-center gap-3 text-white">
            <Store className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />
            <h1 className="text-xl md:text-2xl font-black tracking-tight">Admin</h1>
          </div>
          <button onClick={handleLogout} className="md:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all text-sm">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
        
        <nav className="flex-1 overflow-x-auto md:overflow-y-auto px-4 md:px-6 pb-4 md:pb-6 flex md:flex-col gap-2 md:gap-2 no-scrollbar">
          <button onClick={() => setAdminTab('dashboard')} className={\`flex-shrink-0 flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl font-bold transition-all \${adminTab === 'dashboard' ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}\`}>
            <LayoutGrid className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden md:inline">Dashboard</span>
            <span className="md:hidden text-xs">Home</span>
          </button>
          <button onClick={() => setAdminTab('products')} className={\`flex-shrink-0 flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl font-bold transition-all \${adminTab === 'products' ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}\`}>
            <Package className="w-4 h-4 md:w-5 md:h-5" /> Products
          </button>
          <button onClick={() => setAdminTab('orders')} className={\`flex-shrink-0 flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl font-bold transition-all \${adminTab === 'orders' ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}\`}>
            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" /> Orders
            {orders.length > 0 && <span className="ml-auto bg-rose-500 text-white text-[10px] md:text-xs px-2 py-0.5 rounded-full">{orders.filter(o => o.status === 'Pending').length}</span>}
          </button>
          <button onClick={() => setAdminTab('settings')} className={\`flex-shrink-0 flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl font-bold transition-all \${adminTab === 'settings' ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}\`}>
            <Database className="w-4 h-4 md:w-5 md:h-5" /> Settings
          </button>
          <button onClick={() => setAdminTab('security')} className={\`flex-shrink-0 flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl font-bold transition-all \${adminTab === 'security' ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}\`}>
            <Lock className="w-4 h-4 md:w-5 md:h-5" /> Security
          </button>
        </nav>

        <div className="hidden md:block mt-auto p-6 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-80px)] md:h-screen p-4 md:p-8 bg-zinc-950">
        <div className="max-w-6xl mx-auto pb-20 md:pb-8">
          {formError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
              <X className="w-5 h-5 flex-shrink-0 cursor-pointer hover:text-white" onClick={() => setFormError('')} />
              <p className="text-sm font-semibold">{formError}</p>
            </div>
          )}

          {/* TAB CONTENT: DASHBOARD */}
          {adminTab === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                <div className="bg-zinc-900/80 p-6 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-zinc-900 transition-colors">
                  <div className="bg-amber-500/10 p-4 rounded-xl text-amber-500">
                    <Package className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Products</p>
                    <h3 className="text-3xl font-black text-white">{products.length}</h3>
                  </div>
                </div>
                <div className="bg-zinc-900/80 p-6 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-zinc-900 transition-colors">
                  <div className="bg-purple-500/10 p-4 rounded-xl text-purple-400">
                    <LayoutGrid className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Categories</p>
                    <h3 className="text-3xl font-black text-white">{new Set(products.map(p => p.category)).size}</h3>
                  </div>
                </div>
                <div className="bg-zinc-900/80 p-6 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-zinc-900 transition-colors">
                  <div className="bg-emerald-500/10 p-4 rounded-xl text-emerald-500">
                    <Database className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Database Status</p>
                    <h3 className="text-sm font-bold text-emerald-500 mt-1">Connected & Syncing</h3>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${locationImageBlock}
                ${heroImageBlock}
              </div>
            </div>
          )}

          {/* TAB CONTENT: PRODUCTS */}
          {adminTab === 'products' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl md:text-3xl font-black text-white mb-6">Manage Products</h2>
                ${productsBlock}
             </div>
          )}

          {/* TAB CONTENT: ORDERS */}
          {adminTab === 'orders' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl md:text-3xl font-black text-white mb-6">Manage Orders</h2>
                ${ordersBlock}
             </div>
          )}

          {/* TAB CONTENT: SETTINGS */}
          {adminTab === 'settings' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl md:text-3xl font-black text-white mb-6">Store Settings</h2>
                ${whatsappBlock}
                ${upiBlock}
             </div>
          )}

          {/* TAB CONTENT: SECURITY */}
          {adminTab === 'security' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl md:text-3xl font-black text-white mb-6">Security Settings</h2>
                ${securityBlock}
             </div>
          )}

        </div>
      </main>
    </div>
  );`;

// We also need to update adminTab state from 'products' | 'orders' to the new type
const adminTabStateRegex = /const \[adminTab, setAdminTab\] = useState<'products' \| 'orders'>\('products'\);/g;
let finalContent = normalizedContent.replace(adminTabStateRegex, "const [adminTab, setAdminTab] = useState<'dashboard' | 'products' | 'orders' | 'settings' | 'security'>('dashboard');");

// Replace the old block with the new block
finalContent = finalContent.slice(0, startIndex) + newReturnBlock + finalContent.slice(endIndex + 5);

fs.writeFileSync(filePath, finalContent, 'utf8');
console.log("Successfully restructured Admin Panel.");
