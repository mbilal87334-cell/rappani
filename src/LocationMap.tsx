import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Check, X as CloseIcon } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in react-leaflet
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface LocationMapProps {
  onConfirm: (address: string) => void;
  onCancel: () => void;
}

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (p: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon}></Marker>
  );
}

export default function LocationMap({ onConfirm, onCancel }: LocationMapProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([8.7139, 77.7567]); // Default to Tirunelveli

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
          setPosition(latlng);
        },
        () => {} // fallback to default
      );
    }
  }, []);

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
            setAddress('Location found, but address could not be resolved.');
          }
        } catch (e) {
          setAddress('Error resolving address.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAddress();
    }
  }, [position]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm pt-safe">
        <h2 className="font-black text-lg text-gray-900">Select Location</h2>
        <button onClick={onCancel} className="p-2 -mr-2 rounded-full hover:bg-gray-50">
          <CloseIcon className="w-6 h-6 text-gray-900" />
        </button>
      </div>

      <div className="relative flex-1" style={{ zIndex: 1 }}>
        <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
        
        {/* Instruction overlay */}
        <div className="absolute top-4 left-4 right-4 z-[400] bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-100 text-center text-sm font-bold text-gray-700 pointer-events-none">
          Tap anywhere on the map to place the pin
        </div>
      </div>

      <div className="bg-white p-4 pb-safe border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <div className="bg-gray-50 rounded-xl p-3 mb-4 min-h-[60px] flex items-center justify-center border border-gray-100 text-sm text-gray-700 text-center">
          {isLoading ? (
            <span className="animate-pulse">Loading address...</span>
          ) : position ? (
            <span className="font-medium line-clamp-2">{address}</span>
          ) : (
            <span className="text-gray-400">No location selected</span>
          )}
        </div>
        
        <button 
          onClick={() => position && onConfirm(address)}
          disabled={!position || isLoading}
          className="w-full bg-green-600 text-white rounded-xl py-3.5 font-bold disabled:opacity-50 disabled:bg-gray-400 flex items-center justify-center gap-2 shadow-md shadow-green-500/20"
        >
          <Check className="w-5 h-5" /> Confirm Location
        </button>
      </div>
    </div>
  );
}
