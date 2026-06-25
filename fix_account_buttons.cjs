const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add My Orders state
const addressStateStr = "const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);";
const newStatesStr = `const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);

  useEffect(() => {
    if (isOrdersModalOpen && customerPhone.length === 10) {
      fetch(\`\${API_BASE}/orders/customer/\${customerPhone}\`)
        .then(res => res.json())
        .then(data => setCustomerOrders(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error fetching customer orders", err));
    }
  }, [isOrdersModalOpen, customerPhone]);
`;
content = content.replace(addressStateStr, newStatesStr);

// 2. Fix My Orders Button
const myOrdersRowOld = `<div className="p-4 border-b border-gray-50 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors">
                   <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0"><Package className="w-5 h-5" /></div>
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900">My Orders</h4>
                     <p className="text-xs text-gray-500">View order history</p>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>`;

const myOrdersRowNew = `<div className="p-4 border-b border-gray-50 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setIsOrdersModalOpen(true)}>
                   <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0"><Package className="w-5 h-5" /></div>
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900">My Orders</h4>
                     <p className="text-xs text-gray-500">View order history</p>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>`;
content = content.replace(myOrdersRowOld, myOrdersRowNew);

// 3. Fix Delivery Address Button
const delAddressRowOld = `<div className="p-4 border-b border-gray-50 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors">
                   <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shrink-0"><MapPin className="w-5 h-5" /></div>
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900">Delivery Address</h4>
                     <p className="text-xs text-gray-500">Manage saved addresses</p>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>`;
                
const delAddressRowNew = `<div className="p-4 border-b border-gray-50 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setIsAddressModalOpen(true)}>
                   <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shrink-0"><MapPin className="w-5 h-5" /></div>
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900">Delivery Address</h4>
                     <p className="text-xs text-gray-500">{savedAddresses.length > 0 ? \`\${savedAddresses.length} saved addresses\` : 'Manage saved addresses'}</p>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>`;
content = content.replace(delAddressRowOld, delAddressRowNew);

// 4. Add Orders Modal JSX
const ordersModalJSX = `
      {isOrdersModalOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-gray-100">
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm pt-safe">
            <button onClick={() => setIsOrdersModalOpen(false)} className="p-2 -ml-2 rounded-full hover:bg-gray-50">
              <ChevronRight className="w-6 h-6 text-gray-900 rotate-180" />
            </button>
            <h2 className="font-black text-xl text-gray-900">My Orders</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!customerPhone || customerPhone.length < 10 ? (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Please add your 10-digit phone number in Account to view orders.</p>
              </div>
            ) : customerOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No orders found for this number.</p>
              </div>
            ) : (
              customerOrders.map((order, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}\`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2 whitespace-pre-wrap">{order.itemsSummary}</div>
                  <div className="font-black text-gray-900">₹{order.totalAmount}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
`;

// Insert the modal just before the closing </div> of VisitorPanel
const lastDivIndex = content.lastIndexOf('</div>\n  );\n}');
if (lastDivIndex !== -1) {
  content = content.slice(0, lastDivIndex) + ordersModalJSX + content.slice(lastDivIndex);
} else {
  console.log("Could not find the end of VisitorPanel");
}

let lucideMatch = content.match(/import {([^}]+)} from 'lucide-react';/);
if (lucideMatch) {
  let icons = lucideMatch[1];
  if (!icons.includes('Package')) icons += ', Package';
  
  let newImport = "import {" + icons + "} from 'lucide-react';";
  content = content.replace(lucideMatch[0], newImport);
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log("Successfully fixed Account buttons!");
