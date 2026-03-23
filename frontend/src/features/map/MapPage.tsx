import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '@/store/mapStore';
import { userApi } from '@/services/api';
import { socketService } from '@/services/socket';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistance } from '@/lib/utils';
import { Heart, X, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.DivIcon({
  className: 'custom-user-icon',
  html: `<div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-white flex items-center justify-center shadow-lg">
    <div class="w-8 h-8 rounded-full bg-surface flex items-center justify-center">
      <span class="text-white text-xs font-bold">YOU</span>
    </div>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function LocationMarker() {
  const { userLocation, setUserLocation } = useMapStore();
  const map = useMap();
  const [position, setPosition] = useState<[number, number] | null>(userLocation);

  useEffect(() => {
    if (userLocation) {
      setPosition(userLocation);
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        socketService.updateLocation(loc);
        map.flyTo([pos.coords.latitude, pos.coords.longitude], map.getZoom());
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          alert('Location access denied. Please enable location permissions in your browser settings to use this app.');
        }
      },
      { enableHighAccuracy: true }
    );
  }, [map, setUserLocation, userLocation]);

  return position === null ? null : <Marker position={position} icon={userIcon} />;
}

function MapControls({ userLocation, count }: { userLocation: [number, number] | null; count: number }) {
  const map = useMap();
  
  const centerOnUser = () => {
    if (userLocation) {
      map.flyTo(userLocation, map.getZoom());
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-between items-center">
      <button
        onClick={centerOnUser}
        className="glass rounded-xl px-4 py-2 flex items-center gap-2 cursor-pointer hover:brightness-110 transition"
      >
        <MapPin className="w-5 h-5 text-accent" />
        <span className="font-semibold">{count} people nearby</span>
      </button>
    </div>
  );
}

export default function MapPage() {
  const { userLocation, nearbyUsers, setNearbyUsers, selectedUser, setSelectedUser } = useMapStore();
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<any>(null);

  useEffect(() => {
    if (userLocation) {
      loadNearbyUsers();
    }
  }, [userLocation]);

  const loadNearbyUsers = async () => {
    if (!userLocation) return;
    try {
      const res = await userApi.getNearby(userLocation[1], userLocation[0], 50);
      setNearbyUsers(res.data.data);
    } catch (err) {
      console.error('Failed to load nearby users');
    }
  };

  const handleLike = async (targetUserId: string) => {
    try {
      const res = await userApi.likeUser(targetUserId);
      if (res.data.data.isMutual) {
        setMatchedUser(nearbyUsers.find((u) => u._id === targetUserId));
        setShowMatch(true);
      }
      setNearbyUsers(nearbyUsers.filter((u) => u._id !== targetUserId));
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to like user');
    }
  };

  const handleDislike = async (targetUserId: string) => {
    try {
      await userApi.dislikeUser(targetUserId);
      setNearbyUsers(nearbyUsers.filter((u) => u._id !== targetUserId));
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to dislike user');
    }
  };

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={userLocation || [51.505, -0.09]}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <LocationMarker />
        {nearbyUsers.map((u) => (
          <Marker
            key={u._id}
            position={[u.location?.coordinates[1] || 0, u.location?.coordinates[0] || 0]}
            icon={customIcon}
            eventHandlers={{ click: () => setSelectedUser(u) }}
          >
            <Popup>
              <div className="text-center p-2">
                <p className="font-semibold">{u.name}</p>
                <p className="text-sm text-slate-500">{u.age} years old</p>
              </div>
            </Popup>
          </Marker>
        ))}
        <MapControls userLocation={userLocation} count={nearbyUsers.length} />
      </MapContainer>

      {selectedUser && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] glass rounded-2xl p-4">
          <div className="flex gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={selectedUser.profileImages?.[0]?.url} />
              <AvatarFallback>{selectedUser.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{selectedUser.name}, {selectedUser.age}</h3>
              <p className="text-sm text-slate-400 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {selectedUser.distance ? formatDistance(selectedUser.distance) : 'Unknown'}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedUser.interests?.slice(0, 3).map((int: string) => (
                  <span key={int} className="px-2 py-0.5 bg-surface-light rounded-full text-xs">
                    {int}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button size="icon" variant="destructive" onClick={() => handleDislike(selectedUser._id)}>
                <X className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="default" onClick={() => handleLike(selectedUser._id)}>
                <Heart className="w-5 h-5" />
              </Button>
            </div>
          </div>
          {selectedUser.bio && <p className="mt-3 text-sm text-slate-300">{selectedUser.bio}</p>}
        </div>
      )}

      {showMatch && matchedUser && (
        <div className="absolute inset-0 z-[2000] bg-black/80 flex items-center justify-center">
          <div className="text-center p-8 glass rounded-3xl max-w-sm mx-4">
            <div className="text-6xl mb-4">💕</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              It's a Match!
            </h2>
            <p className="text-slate-300 mt-2">
              You and {matchedUser.name} liked each other
            </p>
            <div className="flex gap-4 mt-6 justify-center">
              <Button variant="outline" onClick={() => setShowMatch(false)}>
                Keep Exploring
              </Button>
              <Button onClick={() => window.location.href = '/app/chat'}>
                Send Message
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
