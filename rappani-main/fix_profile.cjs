const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

const regex = /<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">\s*<div className="w-24 h-24 bg-green-100 rounded-full mb-4 flex items-center justify-center text-green-600">\s*<User className="w-12 h-12" \/>\s*<\/div>\s*<h2 className="text-xl font-bold text-gray-900">{customerName \|\| 'Guest User'}<\/h2>\s*<p className="text-gray-500">{customerPhone \|\| 'Add phone number to track orders'}<\/p>\s*<\/div>/;

const replacement = `<div 
                onClick={() => setIsProfileModalOpen(true)}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative hover:bg-gray-50 cursor-pointer transition-colors"
             >
                <div className="absolute top-4 right-4 bg-green-50 text-green-600 p-2 rounded-full">
                  <Edit className="w-4 h-4" />
                </div>
                <div className="w-24 h-24 bg-green-100 rounded-full mb-4 flex items-center justify-center text-green-600">
                  <User className="w-12 h-12" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{customerName || 'Guest User'}</h2>
                <p className="text-gray-500">{customerPhone || 'Register Number to track orders'}</p>
             </div>`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log("Successfully fixed the Profile card UI!");
} else {
  console.log("Could not find the target text.");
}
