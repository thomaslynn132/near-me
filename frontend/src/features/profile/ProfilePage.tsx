import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { userApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Settings, LogOut, Camera, Save } from 'lucide-react';

const INTERESTS = ['music', 'movies', 'sports', 'travel', 'food', 'art', 'reading', 'gaming', 'fitness', 'photography', 'hiking', 'cooking', 'dancing', 'yoga', 'tech', 'fashion', 'nature', 'books', 'coffee', 'wine'];

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    interests: user?.interests || [],
  });

  const handleSave = async () => {
    try {
      await userApi.updateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile');
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="relative mb-8">
          <div className="h-48 bg-gradient-to-r from-primary to-secondary rounded-2xl" />
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-surface">
                <AvatarImage src={user?.profileImages?.[0]?.url} />
                <AvatarFallback className="text-3xl">{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center border-2 border-surface">
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-20 mb-8">
          {isEditing ? (
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="text-2xl font-bold text-center max-w-xs mx-auto"
            />
          ) : (
            <h1 className="text-2xl font-bold">{user?.name}, {user?.age}</h1>
          )}
          <p className="text-slate-400 mt-1">{user?.email}</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-slate-500">
            <MapPin className="w-4 h-4" />
            <span>Location enabled</span>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>About</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full h-24 bg-surface-light rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-slate-300">{user?.bio || 'No bio yet'}</p>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Interests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => isEditing && toggleInterest(interest)}
                  disabled={!isEditing}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    formData.interests.includes(interest)
                      ? 'bg-primary text-white'
                      : 'bg-surface-light text-slate-400 hover:bg-primary/20'
                  } ${!isEditing && 'cursor-default'}`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <Button className="w-full mb-6" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              App Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
