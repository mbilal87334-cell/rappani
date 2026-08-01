const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add imports
if (!content.includes("import LocationMap from './LocationMap';")) {
  const importsEnd = content.lastIndexOf("import ");
  const nextLine = content.indexOf('\n', importsEnd) + 1;
  content = content.slice(0, nextLine) + "import LocationMap from './LocationMap';\n" + content.slice(nextLine);
  
  if (!content.includes('Map,')) {
    content = content.replace('MapPin,', 'MapPin, Map,');
  }
}

// 2. Add state inside VisitorPanel
const stateRegex = /const \[isPhoneVerified, setIsPhoneVerified\] = useState\([^)]+\);/;
if (stateRegex.test(content) && !content.includes("const [showLocationMap, setShowLocationMap] = useState<'checkout' | 'account' | null>(null);")) {
  content = content.replace(stateRegex, match => match + "\n  const [showLocationMap, setShowLocationMap] = useState<'checkout' | 'account' | null>(null);");
}

// 3. Inject Map component right before VisitorPanel return ends
// The return of VisitorPanel ends with:
//         )}
//       </div>
//     </div>
//   );
// }
// const getCategoryColor = ...
// We can find this specific end pattern.
const endPattern = `        )}
      </div>
    </div>
  );
}`;
const mapComponent = `
      {showLocationMap === 'checkout' && (
        <LocationMap 
          onCancel={() => setShowLocationMap(null)}
          onConfirm={(address) => {
            setDeliveryAddress(address);
            setShowLocationMap(null);
          }}
        />
      )}
      {showLocationMap === 'account' && (
        <LocationMap 
          onCancel={() => setShowLocationMap(null)}
          onConfirm={(address) => {
            setNewSavedAddress(address);
            setShowLocationMap(null);
          }}
        />
      )}
  `;

if (content.includes(endPattern) && !content.includes("<LocationMap")) {
  content = content.replace(endPattern, mapComponent + "\n" + endPattern);
} else {
  // Try another end pattern just in case
  const endPattern2 = `      </div>\n    </div>\n  );\n}`;
  if (content.includes(endPattern2) && !content.includes("<LocationMap")) {
    content = content.replace(endPattern2, mapComponent + "\n" + endPattern2);
  }
}

// 4. Inject into Checkout
const checkoutBtnRegex = /<button \s*onClick=\{fetchLocationForCheckout\}\s*disabled=\{isFetchingLocationCheckout\}\s*className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1 disabled:opacity-50"\s*>\s*<MapPin className="w-3 h-3" \/> \{isFetchingLocationCheckout \? "Fetching..." : "Use Current Location"\}\s*<\/button>/g;

if (checkoutBtnRegex.test(content) && !content.includes("onClick={() => setShowLocationMap('checkout')}")) {
  content = content.replace(checkoutBtnRegex, match => match + `
                                <button 
                                  onClick={() => setShowLocationMap('checkout')}
                                  className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1"
                                >
                                  <Map className="w-3 h-3" /> Pick from Map
                                </button>`);
}

// 5. Inject into Account -> Add New Address
const accountBtnRegex = /<button \s*onClick=\{fetchCurrentLocation\}\s*disabled=\{isFetchingLocation\}\s*className="w-full bg-blue-50 text-blue-600 rounded-xl py-3 mt-4 font-bold disabled:opacity-50 flex items-center justify-center gap-2"\s*>\s*<MapPin className="w-5 h-5" \/> \{isFetchingLocation \? "Fetching..." : "Use Current Location"\}\s*<\/button>/g;

if (accountBtnRegex.test(content) && !content.includes("onClick={() => setShowLocationMap('account')}")) {
  content = content.replace(accountBtnRegex, match => match + `
                        <button 
                          onClick={() => setShowLocationMap('account')}
                          className="w-full bg-blue-50 text-blue-600 rounded-xl py-3 mt-2 font-bold flex items-center justify-center gap-2"
                        >
                          <Map className="w-5 h-5" /> Pick from Map
                        </button>`);
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log("Integration done securely.");
