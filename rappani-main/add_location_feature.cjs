const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add state and fetch function
const addressStateStr = "const [newSavedAddress, setNewSavedAddress] = useState('');";
const newStatesStr = `const [newSavedAddress, setNewSavedAddress] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${latitude}&lon=\${longitude}\`);
          const data = await res.json();
          if (data && data.display_name) {
            setNewSavedAddress(data.display_name);
          } else {
            alert("Could not fetch address details.");
          }
        } catch (err) {
          console.error(err);
          alert("Error fetching address details.");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (err) => {
        console.error(err);
        alert("Please allow location access in your browser.");
        setIsFetchingLocation(false);
      }
    );
  };
`;
content = content.replace(addressStateStr, newStatesStr);

// 2. Add Button to UI
const uiOld = `<div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mt-6">
              <h4 className="font-bold text-gray-900 mb-3">Add New Address</h4>
              <textarea`;
const uiNew = `<div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mt-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-900">Add New Address</h4>
                <button 
                  onClick={fetchCurrentLocation}
                  disabled={isFetchingLocation}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg disabled:opacity-50"
                >
                  <MapPin className="w-3 h-3" />
                  {isFetchingLocation ? "Fetching..." : "Use Current Location"}
                </button>
              </div>
              <textarea`;
content = content.replace(uiOld, uiNew);

fs.writeFileSync(targetPath, content, 'utf8');
console.log("Successfully added Location feature!");
