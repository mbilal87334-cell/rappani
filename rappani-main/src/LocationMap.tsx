import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Check, X as CloseIcon, MapPin, Search, Navigation, Layers, Loader } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon in react-leaflet with Google-style red pin
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface LocationMapProps {
  onConfirm: (address: string, lat?: number, lng?: number) => void;
  onCancel: () => void;
}

function LocationMarker({ position, setPosition }: { position: L.LatLng | null; setPosition: (p: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  );
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 16);
  }, [center, map]);
  return null;
}

export default function LocationMap({ onConfirm, onCancel }: LocationMapProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([8.7139, 77.7567]); // Default to Tirunelveli
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  // Get user GPS location on load
  useEffect(() => {
    handleLocateUser();
  }, []);

  const handleLocateUser = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
          setPosition(latlng);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  // Reverse Geocode when position changes
  useEffect(() => {
    if (position) {
      const fetchAddress = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`);
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(`Pinned Location (${position.lat.toFixed(5)}, ${position.lng.toFixed(5)})`);
          }
        } catch (e) {
          setAddress(`Pinned Location (${position.lat.toFixed(5)}, ${position.lng.toFixed(5)})`);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAddress();
    }
  }, [position]);

  // Handle Search Input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.trim().length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=in&limit=5`);
        const data = await res.json();
        setSearchResults(data || []);
        setShowSearchResults(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const latlng = new L.LatLng(lat, lon);

    setMapCenter([lat, lon]);
    setPosition(latlng);
    setAddress(result.display_name);
    setSearchQuery(result.display_name.split(',')[0]);
    setShowSearchResults(false);
  };

  // Tile URLs for Google Maps
  const googleRoadmapUrl = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
  const googleSatelliteUrl = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}";

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-gray-100 font-sans">
      {/* Top Bar Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-[450]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-gray-900 leading-tight">Google Map Location</h2>
            <p className="text-[11px] text-gray-500">Tap anywhere on map to pin delivery address</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Map Container & Floating UI */}
      <div className="relative flex-1" style={{ zIndex: 1 }}>
        <MapContainer center={mapCenter} zoom={16} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url={mapType === 'roadmap' ? googleRoadmapUrl : googleSatelliteUrl}
            maxZoom={20}
            attribution="&copy; Google Maps"
          />
          <LocationMarker position={position} setPosition={setPosition} />
          <RecenterMap center={mapCenter} />
        </MapContainer>

        {/* Search Bar Overlay */}
        <div className="absolute top-3 left-3 right-3 z-[400]">
          <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 flex items-center px-3 py-2">
            <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search area, street, landmark in Google Maps..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              className="w-full text-sm outline-none bg-transparent font-medium text-gray-800 placeholder-gray-400"
            />
            {isSearching && <Loader className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0 ml-2" />}
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchResults(false); }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="mt-1 bg-white rounded-xl shadow-xl border border-gray-200 max-h-60 overflow-y-auto divide-y divide-gray-100">
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSearchResult(item)}
                  className="p-3 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer flex items-start gap-2.5 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900">{item.display_name.split(',')[0]}</p>
                    <p className="text-gray-500 line-clamp-1 mt-0.5">{item.display_name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Action Controls (GPS & Map Type) */}
        <div className="absolute bottom-6 right-4 z-[400] flex flex-col gap-2">
          {/* Map Type Switcher */}
          <button
            onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
            className="w-11 h-11 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all"
            title="Switch Map Type"
          >
            <Layers className="w-5 h-5 text-indigo-600" />
          </button>

          {/* Locate GPS Button */}
          <button
            onClick={handleLocateUser}
            className="w-11 h-11 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-all"
            title="My Current Location"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Instruction Banner */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[390] bg-gray-900/80 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm pointer-events-none whitespace-nowrap">
          📍 Tap Google Map to set exact delivery pin
        </div>
      </div>

      {/* Bottom Address Confirmation Bar */}
      <div className="bg-white p-4 pb-safe border-t border-gray-200 shadow-2xl z-[450]">
        <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-200 flex items-start gap-2.5">
          <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pinned Location</p>
            {isLoading ? (
              <p className="text-xs font-semibold text-gray-500 animate-pulse mt-0.5">Fetching address from Google Maps...</p>
            ) : address ? (
              <p className="text-xs font-semibold text-gray-800 line-clamp-2 mt-0.5 leading-snug">{address}</p>
            ) : (
              <p className="text-xs font-semibold text-gray-400 mt-0.5">Tap on Google Map above to pin your address</p>
            )}
          </div>
        </div>

        <button
          onClick={() => position && onConfirm(address, position.lat, position.lng)}
          disabled={!position || isLoading}
          className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-3.5 font-bold text-sm disabled:opacity-50 disabled:bg-gray-400 flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <Check className="w-5 h-5" /> Confirm Location & Pin Address
        </button>
      </div>
    </div>
  );
}
