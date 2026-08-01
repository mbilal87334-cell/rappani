const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add savedAddresses state next to deliveryAddress
const deliveryAddressState = "const [deliveryAddress, setDeliveryAddress] = useState('');";
const savedAddressesState = `const [deliveryAddress, setDeliveryAddress] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('rappani_saved_addresses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('rappani_saved_addresses', JSON.stringify(savedAddresses));
    } catch (e) {
      console.error("Failed to save addresses", e);
    }
  }, [savedAddresses]);
  
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newSavedAddress, setNewSavedAddress] = useState('');
`;
content = content.replace(deliveryAddressState, savedAddressesState);

// 2. Update Cart Delivery section
const cartDeliverySectionOld = `<label className="text-xs font-bold text-gray-500 mb-1.5 block">{t.enterAddress}</label>
                             <textarea 
                             className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 h-24 resize-none transition-shadow" 
                             placeholder="Enter Full Delivery Address" 
                             value={deliveryAddress}
                             onChange={e => setDeliveryAddress(e.target.value)}
                             />`;

const cartDeliverySectionNew = `<div className="flex justify-between items-center mb-1.5">
                               <label className="text-xs font-bold text-gray-500">{t.enterAddress}</label>
                             </div>
                             
                             {savedAddresses.length > 0 && (
                               <div className="mb-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                 {savedAddresses.map((addr, idx) => (
                                   <button 
                                     key={idx} 
                                     onClick={() => setDeliveryAddress(addr)}
                                     className={\`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border transition-colors \${deliveryAddress === addr ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-600'}\`}
                                   >
                                     <MapPin className="w-3 h-3 inline-block mr-1 mb-0.5" /> Address {idx + 1}
                                   </button>
                                 ))}
                               </div>
                             )}

                             <textarea 
                             className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 h-24 resize-none transition-shadow" 
                             placeholder="Enter Full Delivery Address" 
                             value={deliveryAddress}
                             onChange={e => setDeliveryAddress(e.target.value)}
                             />
                             
                             {deliveryAddress.trim() && !savedAddresses.includes(deliveryAddress.trim()) && (
                               <button 
                                 onClick={() => setSavedAddresses([...savedAddresses, deliveryAddress.trim()])}
                                 className="mt-2 flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full w-max"
                               >
                                 <Plus className="w-3 h-3" /> Save this address for next time
                               </button>
                             )}`;
                             
content = content.replace(cartDeliverySectionOld, cartDeliverySectionNew);

// 3. Update Account Delivery Address Row
const accountAddressRowOld = `<div className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100">
                   <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shrink-0"><MapPin className="w-5 h-5" /></div>
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900">Delivery Address</h4>
                     <p className="text-xs text-gray-500">Manage saved addresses</p>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>`;

const accountAddressRowNew = `<div className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100" onClick={() => setIsAddressModalOpen(true)}>
                   <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shrink-0"><MapPin className="w-5 h-5" /></div>
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900">Delivery Address</h4>
                     <p className="text-xs text-gray-500">{savedAddresses.length > 0 ? \`\${savedAddresses.length} saved addresses\` : 'Manage saved addresses'}</p>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>`;

content = content.replace(accountAddressRowOld, accountAddressRowNew);

// 4. Add Address Modal
const modalJSX = `
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-gray-100">
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm pt-safe">
            <button onClick={() => setIsAddressModalOpen(false)} className="p-2 -ml-2 rounded-full hover:bg-gray-50">
              <ChevronRight className="w-6 h-6 text-gray-900 rotate-180" />
            </button>
            <h2 className="font-black text-xl text-gray-900">Saved Addresses</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {savedAddresses.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No saved addresses yet</p>
              </div>
            ) : (
              savedAddresses.map((addr, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-3 relative">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pr-8">
                    <h4 className="font-bold text-gray-900 mb-1">Address {idx + 1}</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{addr}</p>
                  </div>
                  <button 
                    onClick={() => setSavedAddresses(savedAddresses.filter((_, i) => i !== idx))}
                    className="absolute top-4 right-4 p-2 text-rose-500 bg-rose-50 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
            
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mt-6">
              <h4 className="font-bold text-gray-900 mb-3">Add New Address</h4>
              <textarea 
                className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 h-24 resize-none transition-shadow mb-3" 
                placeholder="Enter Full Delivery Address" 
                value={newSavedAddress}
                onChange={e => setNewSavedAddress(e.target.value)}
              />
              <button 
                onClick={() => {
                  if(newSavedAddress.trim()) {
                    setSavedAddresses([...savedAddresses, newSavedAddress.trim()]);
                    setNewSavedAddress('');
                  }
                }}
                disabled={!newSavedAddress.trim()}
                className="w-full bg-green-600 text-white rounded-xl py-3 font-bold disabled:opacity-50 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Save Address
              </button>
            </div>
          </div>
        </div>
      )}
`;

// Insert the modal just before the closing </div> of VisitorPanel
const lastDivIndex = content.lastIndexOf('</div>\n  );\n}');
if (lastDivIndex !== -1) {
  content = content.slice(0, lastDivIndex) + modalJSX + content.slice(lastDivIndex);
} else {
  console.log("Could not find the end of VisitorPanel");
}

// 5. Check imports for Plus and Trash2, add them if missing
let lucideMatch = content.match(/import {([^}]+)} from 'lucide-react';/);
if (lucideMatch) {
  let icons = lucideMatch[1];
  if (!icons.includes('Plus')) icons += ', Plus';
  if (!icons.includes('Trash2')) icons += ', Trash2';
  if (!icons.includes('MapPin')) icons += ', MapPin';
  
  let newImport = "import {" + icons + "} from 'lucide-react';";
  content = content.replace(lucideMatch[0], newImport);
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log("Successfully added Address Book feature!");
