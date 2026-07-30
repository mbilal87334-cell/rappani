import fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf-8');
const classRegex = /className=["']([^"']+)["']/g;
let match;
const classes = new Set();

while ((match = classRegex.exec(content)) !== null) {
    const clsList = match[1].split(/\s+/);
    for (const cls of clsList) {
        if (cls) classes.add(cls.trim());
    }
}

const colors = Array.from(classes).filter(c => 
    c.startsWith('bg-') || 
    c.startsWith('text-') || 
    c.startsWith('border-') || 
    c.startsWith('ring-') ||
    c.startsWith('from-') ||
    c.startsWith('to-')
);

console.log(colors.sort().join('\n'));
