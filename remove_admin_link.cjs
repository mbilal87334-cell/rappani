const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

const targetStr = `                <div className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => window.location.href = '/admin'}>
                   <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center shrink-0"><Lock className="w-5 h-5" /></div>
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900">Admin Panel</h4>
                     <p className="text-xs text-gray-500">Store owner login</p>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, '');
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log("Successfully removed Admin Panel link.");
} else {
    // try removing carriage returns
    const normalizedContent = content.replace(/\r\n/g, '\n');
    const normalizedTarget = targetStr.replace(/\r\n/g, '\n');
    if (normalizedContent.includes(normalizedTarget)) {
        content = normalizedContent.replace(normalizedTarget, '');
        fs.writeFileSync(targetPath, content, 'utf8');
        console.log("Successfully removed Admin Panel link with normalized line endings.");
    } else {
        console.log("Could not find the target string.");
    }
}
