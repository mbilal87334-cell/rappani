const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Remove the Admin Dashboard link from VisitorPanel
const adminLinkRegex = /<div className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick=\{[^\}]+\}\>\s*<div className="w-10 h-10 bg-zinc-900 text-white rounded-full flex items-center justify-center shrink-0"\><Database className="w-5 h-5" \/><\/div>\s*<div className="flex-1"\>\s*<div className="font-black text-gray-900"\>Admin Dashboard<\/div>\s*<div className="text-xs text-gray-500 font-medium"\>Manage store & products<\/div>\s*<\/div>\s*<ChevronRight className="w-5 h-5 text-gray-400" \/>\s*<\/div>/g;

content = content.replace(adminLinkRegex, '');

// 2. Add phone state to AdminPanel
if (!content.includes("const [phone, setPhone] = useState('');")) {
  content = content.replace(
    "const [password, setPassword] = useState('');",
    "const [phone, setPhone] = useState('');\n  const [password, setPassword] = useState('');"
  );
}

// 3. Update handleLogin
const loginBodyRegex = /body: JSON\.stringify\(\{ password \}\)/;
if (content.match(loginBodyRegex)) {
  content = content.replace(loginBodyRegex, "body: JSON.stringify({ phone, password })");
}

// 4. Update Admin Login UI to include Phone input
// We need to find the password input div and prepend a phone input div
const passwordFieldUI = `<div className="space-y-2">
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-white/5 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all bg-zinc-800/50/50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>`;

const phoneFieldUI = `<div className="space-y-2">
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-white/5 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all bg-zinc-800/50/50"
                  placeholder="9876543210"
                  required
                />
              </div>
            </div>
            ` + passwordFieldUI;

if (content.includes(passwordFieldUI) && !content.includes("Phone Number</label>")) {
  content = content.replace(passwordFieldUI, phoneFieldUI);
} else {
  // Try a regex approach for UI replacement just in case spaces differ
  const pwdUIRegex = /<div className="space-y-2">\s*<label className="block text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Password<\/label>[\s\S]*?<\/div>\s*<\/div>/;
  const match = content.match(pwdUIRegex);
  if (match && !content.includes("Phone Number</label>")) {
    const fullPhoneField = `<div className="space-y-2">
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-white/5 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all bg-zinc-800/50/50 text-white"
                  placeholder="9876543210"
                  required
                />
              </div>
            </div>
            ${match[0].replace('bg-zinc-800/50/50"', 'bg-zinc-800/50/50 text-white"')}`;
    content = content.replace(match[0], fullPhoneField);
  }
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log("Admin updates completed via node script.");
