const fs = require('fs');

const appPath = 'src/App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

const replacements = {
  'bg-stone-900': 'bg-zinc-950',
  'bg-stone-800': 'bg-zinc-900',
  'bg-white': 'bg-zinc-900/40 glass',
  'text-stone-900': 'text-white',
  'text-stone-800': 'text-zinc-200',
  'text-stone-600': 'text-zinc-400',
  'text-stone-500': 'text-zinc-400',
  'bg-stone-50': 'bg-zinc-800/50',
  'bg-stone-100': 'bg-zinc-800/80',
  'bg-[#fafaf9]': 'bg-zinc-900/50',
  'border-stone-100': 'border-white/5',
  'border-stone-200': 'border-white/10',
  'bg-rose-500': 'bg-gradient-to-r from-amber-500 to-amber-600',
  'hover:bg-rose-600': 'hover:from-amber-400 hover:to-amber-500',
  'text-rose-500': 'text-amber-500',
  'from-rose-500': 'from-amber-400',
  'to-orange-500': 'to-amber-600',
  'shadow-rose-500/20': 'shadow-amber-500/20',
  'shadow-rose-500/30': 'shadow-amber-500/30',
  'shadow-rose-500/40': 'shadow-amber-500/40',
  'bg-blue-500/10': 'bg-purple-500/15',
  'bg-blue-50': 'bg-purple-500/10',
  'text-blue-500': 'text-purple-400',
  'bg-[#0a0a0a]': 'bg-zinc-950',
  'from-[#0a0a0a]': 'from-zinc-950',
  'via-[#0a0a0a]/80': 'via-zinc-950/80',
  'bg-rose-50': 'bg-amber-500/10'
};

for (const [search, replace] of Object.entries(replacements)) {
  content = content.split(search).join(replace);
}

// Special case: fix any "glass glass" mistakes if there was already a glass class
content = content.split('glass glass').join('glass');

// Special case: make product cards use the premium-card class
content = content.split('className="bg-zinc-900/40 glass rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-500 border border-white/5 group flex flex-col relative h-full"')
                 .join('className="premium-card group flex flex-col relative h-full"');

fs.writeFileSync(appPath, content);
console.log('App.tsx updated to premium theme!');
