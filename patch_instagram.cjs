const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const helpers = `
export const getInstagramUrl = (handleOrUrl: string) => {
  if (!handleOrUrl) return '';
  if (handleOrUrl.startsWith('http://') || handleOrUrl.startsWith('https://')) return handleOrUrl;
  return \`https://instagram.com/\${handleOrUrl.replace('@', '')}\`;
};

export const getInstagramDisplay = (handleOrUrl: string) => {
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

if (!appContent.includes('export const getInstagramUrl')) {
    appContent = appContent.replace(
      "export const API_BASE = '/api';",
      `export const API_BASE = '/api';\n${helpers}`
    );
    fs.writeFileSync('src/App.tsx', appContent);
    console.log("App.tsx patched successfully.");
} else {
    console.log("Already patched.");
}
