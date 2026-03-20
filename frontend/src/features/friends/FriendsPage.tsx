import { useEffect, useState } from 'react';
import { friendApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Check, X, UserMinus } from 'lucide-react';

interface Friend {
  _id: string;
  name: string;
  age: number;
  bio: string;
  profileImages: { url: string }[];
  isOnline: boolean;
}

interface FriendRequest {
  _id: string;
  sender: Friend;
  createdAt: string;
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, []);

  const loadFriends = async () => {
    try {
      const res = await friendApi.getFriends();
      setFriends(res.data.data);
    } catch (err) {
      console.error('Failed to load friends');
    }
  };

  const loadRequests = async () => {
    try {
      const res = await friendApi.getPendingRequests();
      setRequests(res.data.data);
    } catch (err) {
      console.error('Failed to load requests');
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await friendApi.acceptRequest(requestId);
      loadFriends();
      loadRequests();
    } catch (err) {
      console.error('Failed to accept request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await friendApi.rejectRequest(requestId);
      loadRequests();
    } catch (err) {
      console.error('Failed to reject request');
    }
  };

  const handleRemove = async (friendId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    try {
      await friendApi.removeFriend(friendId);
      loadFriends();
    } catch (err) {
      console.error('Failed to remove friend');
    }
  };

  return (
    <div className="h-full p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Friends</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'friends' ? 'bg-primary text-white' : 'bg-surface-light text-slate-400'
          }`}
        >
          Friends ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-lg transition-colors relative ${
            activeTab === 'requests' ? 'bg-primary text-white' : 'bg-surface-light text-slate-400'
          }`}
        >
          Requests ({requests.length})
          {requests.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary rounded-full text-xs flex items-center justify-center">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'friends' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.map((friend) => (
            <div key={friend._id} className="bg-surface rounded-xl p-4 flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={friend.profileImages?.[0]?.url} />
                  <AvatarFallback className="text-xl">{friend.name?.[0]}</AvatarFallback>
                </Avatar>
                {friend.isOnline && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-surface" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{friend.name}</h3>
                <p className="text-sm text-slate-400">{friend.age} years old</p>
                <p className="text-xs text-slate-500">
                  {friend.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <a href="/app/chat">Chat</a>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleRemove(friend._id)}>
                  <UserMinus className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
          {friends.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No friends yet. Send some requests!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-surface rounded-xl p-4 flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={request.sender.profileImages?.[0]?.url} />
                <AvatarFallback className="text-xl">{request.sender.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{request.sender.name}</h3>
                <p className="text-sm text-slate-400">{request.sender.age} years old</p>
                <p className="text-xs text-slate-500">
                  {request.sender.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="icon" onClick={() => handleAccept(request._id)}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => handleReject(request._id)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No pending requests</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
