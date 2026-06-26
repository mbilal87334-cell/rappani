const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add state
const searchState = "const [isPhoneVerified, setIsPhoneVerified] = useState(() => localStorage.getItem('rappani_is_verified') === 'true');";
if (content.includes(searchState) && !content.includes("const [showLocationMap, setShowLocationMap] = useState")) {
  content = content.replace(searchState, searchState + "\n  const [showLocationMap, setShowLocationMap] = useState<'checkout' | 'account' | null>(null);");
}

// 2. Add LocationMap component
const searchEnd = "const getCategoryColor = (category: string) => {";
const componentStr = `
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

if (content.includes(searchEnd) && !content.includes("<LocationMap ")) {
  // We need to insert it right before the last </div> before getCategoryColor
  // Let's replace:
  // </div>
  //   );
  // }
  // 
  // const getCategoryColor
  const exactEnd = "</div>\n  );\n}\n\nconst getCategoryColor = (category: string) => {";
  if (content.includes(exactEnd)) {
    content = content.replace(exactEnd, componentStr + "\n" + exactEnd);
  } else {
    // try a more generic replacement
    const replacement = componentStr + "\n</div>\n  );\n}\n\nconst getCategoryColor = (category: string) => {";
    content = content.replace(/<\/div>\s*\);\s*}\s*const getCategoryColor = \(category: string\) => \{/, replacement);
  }
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log("Fix injected successfully.");
