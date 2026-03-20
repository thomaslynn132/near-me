import { create } from 'zustand';

interface User {
  _id: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  profileImages: { url: string }[];
  isOnline: boolean;
  distance?: number;
}

interface MapState {
  userLocation: [number, number] | null;
  nearbyUsers: User[];
  selectedUser: User | null;
  radius: number;
  setUserLocation: (location: [number, number]) => void;
  setNearbyUsers: (users: User[]) => void;
  setSelectedUser: (user: User | null) => void;
  setRadius: (radius: number) => void;
}

export const useMapStore = create<MapState>((set) => ({
  userLocation: null,
  nearbyUsers: [],
  selectedUser: null,
  radius: 50,

  setUserLocation: (location) => set({ userLocation: location }),
  setNearbyUsers: (users) => set({ nearbyUsers: users }),
  setSelectedUser: (user) => set({ selectedUser: user }),
  setRadius: (radius) => set({ radius }),
}));
