const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

const regex = /<h4 className="font-bold text-gray-900 mb-3">Add New Address<\/h4>/;
const replacement = `<div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-900">Add New Address</h4>
                <button 
                  onClick={fetchCurrentLocation}
                  disabled={isFetchingLocation}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg disabled:opacity-50"
                >
                  <MapPin className="w-3 h-3" />
                  {isFetchingLocation ? "Fetching..." : "Use Current Location"}
                </button>
              </div>`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log("Successfully fixed the UI!");
} else {
  console.log("Could not find the target text.");
}
