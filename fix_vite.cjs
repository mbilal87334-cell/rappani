const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

code = code.replace("    },,", "    },");
fs.writeFileSync('vite.config.ts', code, 'utf8');
console.log('Fixed vite.config.ts syntax error');
