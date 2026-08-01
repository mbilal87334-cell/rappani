const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'src', 'App.tsx'),
  path.join(__dirname, 'src', 'LocationMap.tsx')
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Replace generic text-green-600/500/700 with text-gold-500 or text-black
    content = content.replace(/text-green-600/g, 'text-gold-600');
    content = content.replace(/text-green-500/g, 'text-gold-500');
    content = content.replace(/text-green-700/g, 'text-gold-900');
    content = content.replace(/text-green-800/g, 'text-gold-900');
    content = content.replace(/text-green-900/g, 'text-gold-900');
    
    // Replace backgrounds
    content = content.replace(/bg-green-600/g, 'bg-black');
    content = content.replace(/bg-green-500/g, 'bg-black');
    content = content.replace(/bg-green-700/g, 'bg-stone-900');
    content = content.replace(/bg-green-50/g, 'bg-gold-50');
    content = content.replace(/bg-green-100/g, 'bg-gold-100');

    // Replace borders
    content = content.replace(/border-green-200/g, 'border-gold-500/30');
    content = content.replace(/border-green-500/g, 'border-gold-500');
    content = content.replace(/border-green-600/g, 'border-gold-600');

    // Replace ring/focus
    content = content.replace(/ring-green-500/g, 'ring-gold-500');
    content = content.replace(/focus:border-green-500/g, 'focus:border-gold-500');
    
    // Replace text-gray-500 with text-stone-500 for a warmer elegant tone
    content = content.replace(/text-gray-500/g, 'text-stone-500');
    content = content.replace(/text-gray-600/g, 'text-stone-600');
    content = content.replace(/text-gray-400/g, 'text-stone-400');
    content = content.replace(/bg-gray-50/g, 'bg-stone-50');

    fs.writeFileSync(file, content);
    console.log(`Updated theme in ${file}`);
  }
}
