import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { IconMapPin } from '@tabler/icons-react';
import Button from './ui/Button';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// A simple dictionary of Kerala districts coordinates to mock geolocation
const keralaDistricts = {
  "Thiruvananthapuram": [8.5241, 76.9366],
  "Kollam": [8.8932, 76.6141],
  "Pathanamthitta": [9.2648, 76.7870],
  "Alappuzha": [9.4981, 76.3388],
  "Kottayam": [9.5916, 76.5222],
  "Idukki": [9.8500, 76.9667],
  "Ernakulam": [9.9816, 76.2999],
  "Thrissur": [10.5276, 76.2144],
  "Palakkad": [10.7867, 76.6548],
  "Malappuram": [11.0732, 76.0740],
  "Kozhikode": [11.2588, 75.7804],
  "Wayanad": [11.6854, 76.1320],
  "Kannur": [11.8745, 75.3704],
  "Kasaragod": [12.4996, 74.9869]
};

// Component to dynamically fit map to markers
const MapBounds = ({ markers }) => {
  const map = useMap();
  
  useEffect(() => {
    if (markers && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => m.position));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [markers, map]);
  
  return null;
};

const MapComponent = ({ vehicles, onVehicleClick }) => {
  // Generate markers. Use vehicle.coordinates if available, else fallback to mock offset
  const markers = vehicles.map(vehicle => {
    let position;
    if (vehicle.coordinates && vehicle.coordinates.lat && vehicle.coordinates.lng) {
      // Add a microscopic offset to prevent exact identical coordinates from stacking
      const tinyOffsetLat = (Math.random() - 0.5) * 0.0005;
      const tinyOffsetLng = (Math.random() - 0.5) * 0.0005;
      position = [vehicle.coordinates.lat + tinyOffsetLat, vehicle.coordinates.lng + tinyOffsetLng];
    } else {
      const baseCoords = keralaDistricts[vehicle.district] || [10.8505, 76.2711]; // Default to center of Kerala
      const randomOffsetLat = (Math.random() - 0.5) * 0.05;
      const randomOffsetLng = (Math.random() - 0.5) * 0.05;
      position = [baseCoords[0] + randomOffsetLat, baseCoords[1] + randomOffsetLng];
    }
    
    return {
      id: vehicle._id,
      position,
      vehicle
    };
  });

  const center = markers.length > 0 ? markers[0].position : [10.8505, 76.2711];

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-slate-200 shadow-premium relative z-0">
      <MapContainer center={center} zoom={7} className="w-full h-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {markers.map(marker => (
          <Marker key={marker.id} position={marker.position}>
            <Popup className="rounded-xl overflow-hidden">
              <div className="w-48 text-center">
                <div className="w-full h-24 bg-slate-100 rounded-lg overflow-hidden mb-2">
                  <img 
                    src={marker.vehicle.images?.[0] || '/dummy.png'} 
                    alt={marker.vehicle.model}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-slate-800 text-sm truncate">{marker.vehicle.brand} {marker.vehicle.model}</h3>
                <p className="text-accent-600 font-bold mb-2">₹{marker.vehicle.price}/day</p>
                <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-3">
                  <IconMapPin size={12} />
                  <span className="truncate">{marker.vehicle.location}, {marker.vehicle.district}</span>
                </div>
                <Button 
                  size="sm" 
                  className="w-full" 
                  onClick={() => onVehicleClick(marker.vehicle.model)}
                >
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <MapBounds markers={markers} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
