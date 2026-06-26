const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');
content = content.replace(/\r\n/g, '\n');

// 1. Remove Return to Store
const returnToStoreBtn = `            <button type="button" onClick={() => navigate('/')} className="w-full text-stone-400 hover:text-zinc-400 py-2 text-sm font-bold transition-colors">
              ← Return to Store
            </button>`;

if (content.includes(returnToStoreBtn)) {
    content = content.replace(returnToStoreBtn, '');
    console.log("Successfully removed Return to Store.");
}

// 2. Remove View Store
const viewStoreBtn = `            <button onClick={() => navigate('/')} className="text-sm font-medium text-stone-300 hover:text-white transition-colors hidden sm:block">View Store</button>`;

if (content.includes(viewStoreBtn)) {
    content = content.replace(viewStoreBtn, '');
    console.log("Successfully removed View Store.");
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log("Done removing admin panel buttons.");
