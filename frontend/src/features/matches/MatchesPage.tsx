import { useEffect, useState } from 'react';
import { useMatchStore } from '@/store/matchStore';
import { matchApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Eye, EyeOff, MessageCircle } from 'lucide-react';

export default function MatchesPage() {
  const { matches, blindMatches, setMatches, setBlindMatches } = useMatchStore();
  const [activeTab, setActiveTab] = useState<'matches' | 'blind'>('matches');
  const [revealingMatch, setRevealingMatch] = useState<string | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const [matchesRes, blindRes] = await Promise.all([
        matchApi.getMatches(),
        matchApi.getBlindMatches(),
      ]);
      setMatches(matchesRes.data.data);
      setBlindMatches(blindRes.data.data);
    } catch (err) {
      console.error('Failed to load matches');
    }
  };

  const handleReveal = async (matchId: string) => {
    try {
      setRevealingMatch(matchId);
      await matchApi.revealMatch(matchId);
      await loadMatches();
    } catch (err) {
      console.error('Failed to reveal match');
    } finally {
      setRevealingMatch(null);
    }
  };

  const handleUnmatch = async (matchId: string) => {
    if (!confirm('Are you sure you want to unmatch?')) return;
    try {
      await matchApi.unmatch(matchId);
      loadMatches();
    } catch (err) {
      console.error('Failed to unmatch');
    }
  };

  return (
    <div className="h-full p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Your Matches</h1>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('matches')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'matches' ? 'bg-primary text-white' : 'bg-surface-light text-slate-400'
          }`}
        >
          Matches ({matches.length})
        </button>
        <button
          onClick={() => setActiveTab('blind')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'blind' ? 'bg-primary text-white' : 'bg-surface-light text-slate-400'
          }`}
        >
          <EyeOff className="w-4 h-4" />
          Blind Matches ({blindMatches.length})
        </button>
      </div>

      {activeTab === 'matches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match) => (
            <Card key={match._id} className="overflow-hidden">
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
                <Avatar className="w-24 h-24 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ring-4 ring-surface">
                  <AvatarImage src={match.otherUser?.profileImages?.[0]?.url} />
                  <AvatarFallback className="text-2xl">{match.otherUser?.name?.[0]}</AvatarFallback>
                </Avatar>
                {match.otherUser?.isOnline && (
                  <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-surface" />
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">{match.otherUser?.name}, {match.otherUser?.age}</h3>
                <p className="text-sm text-slate-400 line-clamp-2 mt-1">{match.otherUser?.bio || 'No bio'}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href="/app/chat">Chat</a>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleUnmatch(match._id)}>
                    Unmatch
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {matches.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No matches yet. Keep exploring!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'blind' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blindMatches.map((match) => (
            <Card key={match._id} className="overflow-hidden">
              <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-2">🎭</div>
                  <p className="text-slate-400">Blind Match</p>
                </div>
                {match.messageCount >= match.revealThreshold && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Ready to reveal!
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">Anonymous ({match.otherUser?.age})</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {match.messageCount} messages • Need {match.revealThreshold - match.messageCount} more to reveal
                </p>
                <div className="flex gap-2 mt-4">
                  {match.messageCount >= match.revealThreshold ? (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleReveal(match._id)}
                      disabled={revealingMatch === match._id}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {revealingMatch === match._id ? 'Revealing...' : 'Reveal Profile'}
                    </Button>
                  ) : (
                    <Button size="sm" className="flex-1" asChild>
                      <a href="/app/chat">Continue Chatting</a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {blindMatches.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              <EyeOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No blind matches. Enable blind matching in settings!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
