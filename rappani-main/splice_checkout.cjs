const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');
const lines = content.split('\n');

const replacement = `                       {deliveryMethod === 'home' && (
                          <div className="space-y-3">
                             <div className="flex justify-between items-end mb-1">
                               <p className="text-sm font-bold text-gray-700">Delivery Address</p>
                               <button 
                                  onClick={fetchLocationForCheckout}
                                  disabled={isFetchingLocationCheckout}
                                  className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1 disabled:opacity-50"
                                >
                                  <MapPin className="w-3 h-3" /> {isFetchingLocationCheckout ? "Fetching..." : "Use Current Location"}
                                </button>
                             </div>
                             <textarea 
                                placeholder="Enter Full Delivery Address" 
                                value={deliveryAddress}
                                onChange={e => setDeliveryAddress(e.target.value)}
                                rows={3}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm resize-none"
                             />
                             {savedAddresses.length > 0 && (
                                <div className="space-y-2 mt-2">
                                   <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Saved Address</p>
                                   <div className="flex gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar">
                                      {savedAddresses.map((addr, idx) => (
                                         <div 
                                           key={idx} 
                                           onClick={() => setDeliveryAddress(addr)}
                                           className="snap-start shrink-0 w-[200px] bg-white border border-gray-200 rounded-xl p-3 cursor-pointer hover:border-green-500 transition-colors"
                                         >
                                            <p className="text-xs text-gray-700 line-clamp-2">{addr}</p>
                                         </div>
                                      ))}
                                   </div>
                                </div>
                             )}
                          </div>
                       )}`;

lines.splice(1205, 9, replacement);

fs.writeFileSync(targetPath, lines.join('\n'), 'utf8');
console.log("Splice success!");
