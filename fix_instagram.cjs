const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const helpers = `
const getInstagramUrl = (handleOrUrl: string) => {
  if (!handleOrUrl) return '';
  if (handleOrUrl.startsWith('http://') || handleOrUrl.startsWith('https://')) return handleOrUrl;
  return \`https://instagram.com/\${handleOrUrl.replace('@', '')}\`;
};

const getInstagramDisplay = (handleOrUrl: string) => {
  if (!handleOrUrl) return '';
  if (handleOrUrl.startsWith('http://') || handleOrUrl.startsWith('https://')) {
    try {
      const url = new URL(handleOrUrl);
      const path = url.pathname.split('/').filter(Boolean)[0];
      return path ? \`@\${path}\` : handleOrUrl;
    } catch {
      return handleOrUrl;
    }
  }
  return handleOrUrl.startsWith('@') ? handleOrUrl : \`@\${handleOrUrl}\`;
};
`;

// Insert helpers after imports
appContent = appContent.replace(
  "const AdminApp = lazy(() => import('./admin/AdminApp'));\nimport LocationMap from './LocationMap';",
  `const AdminApp = lazy(() => import('./admin/AdminApp'));\nimport LocationMap from './LocationMap';\n\n${helpers}\n`
);

// Replace Line 2012
appContent = appContent.replace(
  '<a href={shop.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold text-neutral-700 bg-pink-50 px-3 py-1.5 rounded-lg hover:bg-pink-100 transition-colors">',
  '<a href={getInstagramUrl(shop.instagram)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold text-neutral-700 bg-pink-50 px-3 py-1.5 rounded-lg hover:bg-pink-100 transition-colors">'
);

// Replace Line 2775
appContent = appContent.replace(
  '<a href={`https://instagram.com/${activeShopContext.instagram.replace(\'@\', \'\')}`} target="_blank" rel="noreferrer" className="p-4 flex items-center gap-4 hover:bg-gold-50 transition-colors">',
  '<a href={getInstagramUrl(activeShopContext.instagram)} target="_blank" rel="noreferrer" className="p-4 flex items-center gap-4 hover:bg-gold-50 transition-colors">'
);

// Replace Line 2781
appContent = appContent.replace(
  '<p className="text-xs text-neutral-500">{activeShopContext.instagram.startsWith(\'@\') ? activeShopContext.instagram : \'@\' + activeShopContext.instagram}</p>',
  '<p className="text-xs text-neutral-500">{getInstagramDisplay(activeShopContext.instagram)}</p>'
);

fs.writeFileSync('src/App.tsx', appContent);
console.log("App.tsx updated successfully.");
