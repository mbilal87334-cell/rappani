const fs = require('fs');
const path = require('path');

// 1. Update server.ts
const serverPath = path.join(__dirname, 'server.ts');
let serverContent = fs.readFileSync(serverPath, 'utf8');

const oldServerRoute = `  app.post("/api/auth/change-password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const setting = await Setting.findOne({ key: 'admin_password' });

      if (!setting || currentPassword !== setting.value) {
        return res.status(401).json({ success: false, error: "Current password incorrect" });
      }

      await Setting.updateOne({ key: 'admin_password' }, { value: newPassword });
      res.json({ success: true });
    } catch (err: any) {
      console.error("[SERVER] Change password err:", err);
      res.status(500).json({ success: false, error: err?.message || "Server error" });
    }
  });`;

const newServerRoute = `  app.post("/api/auth/change-password", async (req, res) => {
    try {
      const { currentPassword, newPassword, newPhone } = req.body;
      const setting = await Setting.findOne({ key: 'admin_password' });

      if (!setting || currentPassword !== setting.value) {
        return res.status(401).json({ success: false, error: "Current password incorrect" });
      }

      if (newPassword) {
        await Setting.updateOne({ key: 'admin_password' }, { value: newPassword });
      }
      if (newPhone) {
        await Setting.updateOne({ key: 'admin_phone' }, { value: newPhone }, { upsert: true });
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error("[SERVER] Change credentials err:", err);
      res.status(500).json({ success: false, error: err?.message || "Server error" });
    }
  });`;

if (serverContent.includes('const { currentPassword, newPassword } = req.body;')) {
    serverContent = serverContent.replace(oldServerRoute, newServerRoute);
    fs.writeFileSync(serverPath, serverContent, 'utf8');
    console.log("Updated server.ts route");
} else {
    // try removing carriage returns
    const nsContent = serverContent.replace(/\r\n/g, '\n');
    const nsTarget = oldServerRoute.replace(/\r\n/g, '\n');
    if (nsContent.includes(nsTarget)) {
        serverContent = nsContent.replace(nsTarget, newServerRoute);
        fs.writeFileSync(serverPath, serverContent, 'utf8');
        console.log("Updated server.ts route (normalized)");
    } else {
        console.log("Could not find server.ts route to update. Falling back to regex...");
        const routeRegex = /app\.post\("\/api\/auth\/change-password"[\s\S]*?res\.status\(500\)[\s\S]*?\}\);\s*\n/;
        if (routeRegex.test(serverContent)) {
             serverContent = serverContent.replace(routeRegex, newServerRoute + '\n');
             fs.writeFileSync(serverPath, serverContent, 'utf8');
             console.log("Updated server.ts route via regex.");
        }
    }
}

// 2. Update App.tsx
const appPath = path.join(__dirname, 'src', 'App.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');

appContent = appContent.replace(
  "const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });",
  "const [passForm, setPassForm] = useState({ current: '', newPhone: '', new: '', confirm: '' });"
);

const oldHandlePassword = `    if (passForm.new !== passForm.confirm) {
      setPassError('New passwords do not match');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passForm.current,
          newPassword: passForm.new
        })
      });`;

const newHandlePassword = `    if (passForm.new && passForm.new !== passForm.confirm) {
      setPassError('New passwords do not match');
      return;
    }
    if (!passForm.new && !passForm.newPhone) {
      setPassError('Please enter a new phone number or a new password');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passForm.current,
          newPassword: passForm.new || undefined,
          newPhone: passForm.newPhone || undefined
        })
      });`;

appContent = appContent.replace(oldHandlePassword, newHandlePassword);
// Normalize just in case
if (!appContent.includes("passForm.newPhone || undefined")) {
    appContent = appContent.replace(/\r\n/g, '\n').replace(oldHandlePassword.replace(/\r\n/g, '\n'), newHandlePassword);
}

appContent = appContent.replace(
  "setPassForm({ current: '', new: '', confirm: '' });",
  "setPassForm({ current: '', newPhone: '', new: '', confirm: '' });"
);

appContent = appContent.replace(
  "<span>Change Password</span>",
  "<span>Change Login</span>"
);

appContent = appContent.replace(
  "<Lock className=\"w-5 h-5 text-amber-500\" /> Change Admin Password",
  "<Lock className=\"w-5 h-5 text-amber-500\" /> Change Login Credentials"
);

const oldFormUi = `<form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Current Password</label>
                <input
                  type="password"
                  value={passForm.current}
                  onChange={(e) => setPassForm({ ...passForm, current: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 focus:ring-2 focus:ring-rose-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">New Password</label>
                <input
                  type="password"
                  value={passForm.new}
                  onChange={(e) => setPassForm({ ...passForm, new: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 focus:ring-2 focus:ring-rose-500 outline-none"
                  required
                />
              </div>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passForm.confirm}
                    onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-white/10 focus:ring-2 focus:ring-rose-500 outline-none"
                    required
                  />
                </div>
                <button type="submit" className="bg-zinc-950 text-white px-6 py-2 rounded-lg font-bold hover:bg-zinc-900 transition-colors">
                  Update
                </button>
              </div>
            </form>`;

const newFormUi = `<form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Current Password *</label>
                <input
                  type="password"
                  value={passForm.current}
                  onChange={(e) => setPassForm({ ...passForm, current: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">New Phone (Optional)</label>
                <input
                  type="tel"
                  value={passForm.newPhone}
                  onChange={(e) => setPassForm({ ...passForm, newPhone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none text-white"
                  placeholder="9876543210"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">New Password (Optional)</label>
                <input
                  type="password"
                  value={passForm.new}
                  onChange={(e) => setPassForm({ ...passForm, new: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none text-white"
                />
              </div>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passForm.confirm}
                    onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none text-white"
                  />
                </div>
                <button type="submit" className="bg-amber-500 text-zinc-950 px-6 py-2 rounded-lg font-bold hover:bg-amber-400 transition-colors">
                  Update
                </button>
              </div>
            </form>`;

let uiReplaced = false;
if (appContent.includes(oldFormUi)) {
    appContent = appContent.replace(oldFormUi, newFormUi);
    uiReplaced = true;
} else {
    const nsApp = appContent.replace(/\r\n/g, '\n');
    const nsOld = oldFormUi.replace(/\r\n/g, '\n');
    if (nsApp.includes(nsOld)) {
        appContent = nsApp.replace(nsOld, newFormUi);
        uiReplaced = true;
    }
}

if (!uiReplaced) {
    console.log("Could not find the UI form to replace. Using regex fallback...");
    const uiRegex = /<form onSubmit=\{handlePasswordChange\}[\s\S]*?Update\s*<\/button>\s*<\/div>\s*<\/form>/;
    appContent = appContent.replace(uiRegex, newFormUi);
}

fs.writeFileSync(appPath, appContent, 'utf8');
console.log("App.tsx updated successfully.");
