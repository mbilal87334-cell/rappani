const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

if (!code.includes("proxy:")) {
    const proxyConfig = `
    server: {
      proxy: {
        '/api': 'http://localhost:5001',
      },
      hmr: process.env.DISABLE_HMR !== 'true',
    },`;
    
    // Replace existing server block
    code = code.replace(/server:\s*\{[^}]*hmr:\s*[^}]*\}/m, proxyConfig.trim());
    fs.writeFileSync('vite.config.ts', code, 'utf8');
    console.log('Added proxy to vite.config.ts');
} else {
    console.log('Proxy already exists in vite.config.ts');
}
