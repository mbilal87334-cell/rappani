const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add isProfileModalOpen state
if (!content.includes('const [isProfileModalOpen, setIsProfileModalOpen]')) {
  const addressStateStr = "const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);";
  const newStatesStr = `${addressStateStr}\n  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);`;
  content = content.replace(addressStateStr, newStatesStr);
}

// 2. Change the profile card to be clickable
const profileOld = `<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-green-100 rounded-full mb-4 flex items-center justify-center text-green-600">
                  <User className="w-12 h-12" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{customerName || 'Guest User'}</h2>
                <p className="text-gray-500">{customerPhone || 'Add phone number to track orders'}</p>
             </div>`;
const profileNew = `<div 
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

if (content.includes(profileOld)) {
  content = content.replace(profileOld, profileNew);
} else {
  console.log("Could not find the profile card text exactly.");
}

// 3. Add the Profile Modal at the end of currentTab === 'account' section
// The section ends right before `</div>` then `</div>`
const gpayConfirmOld = `{showGPayConfirm && (`;
const profileModal = `
             {isProfileModalOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-gray-100">
                  <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm pt-safe">
                    <button onClick={() => setIsProfileModalOpen(false)} className="p-2 -ml-2 rounded-full hover:bg-gray-50">
                      <ChevronRight className="w-6 h-6 text-gray-900 rotate-180" />
                    </button>
                    <h2 className="font-black text-xl text-gray-900">Edit Profile</h2>
                  </div>
                  
                  <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Your Name</label>
                        <input 
                          type="text" 
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Register Number (Phone)</label>
                        <div className="flex gap-2">
                           <div className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-600 font-medium flex items-center justify-center shrink-0">
                             +91
                           </div>
                           <input 
                             type="tel" 
                             maxLength={10}
                             value={customerPhone}
                             onChange={e => setCustomerPhone(e.target.value.replace(/\\D/g, ''))}
                             placeholder="Enter 10-digit mobile number"
                             className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                           />
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setIsProfileModalOpen(false)}
                        className="w-full bg-green-600 text-white rounded-xl py-3 mt-4 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <User className="w-5 h-5" /> Save Profile
                      </button>
                    </div>
                  </div>
                </div>
             )}

             ${gpayConfirmOld}`;

if (content.includes(gpayConfirmOld) && !content.includes('isProfileModalOpen &&')) {
  content = content.replace(gpayConfirmOld, profileModal);
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log("Successfully added Profile feature!");
