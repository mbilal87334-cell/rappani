const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

content = content.replace(
  "import imglyRemoveBackground from '@imgly/background-removal';",
  "import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';"
);

fs.writeFileSync(targetPath, content, 'utf8');
console.log("fixed import.");
