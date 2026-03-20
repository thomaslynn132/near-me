import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Heart, Trash2, Eye, Blind } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Match {
  _id: string;
  users: { _id: string; name: string; email: string }[];
  isBlind: boolean;
  isRevealed: boolean;
  messageCount: number;
  createdAt: string;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadMatches();
  }, [page]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getMatches(page, 20);
      setMatches(res.data.data.matches);
    } catch (err) {
      console.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm('Are you sure you want to delete this match?')) return;
    try {
      await adminApi.deleteMatch(matchId);
      loadMatches();
    } catch (err) {
      console.error('Failed to delete match');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Match Management</h1>
        <Badge variant="secondary">{matches.length} matches</Badge>
      </div>

      <Card className="border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400" />
            All Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No matches found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Users</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => (
                    <TableRow key={match._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {match.users.map((user, i) => (
                            <span key={user._id}>
                              {user.name}
                              {i < match.users.length - 1 && <span className="text-slate-500 mx-1">&</span>}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {match.isBlind ? (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <Blind className="w-3 h-3" />
                            Blind
                          </Badge>
                        ) : (
                          <Badge variant="default">Normal</Badge>
                        )}
                      </TableCell>
                      <TableCell>{match.messageCount}</TableCell>
                      <TableCell>
                        {match.isBlind && !match.isRevealed ? (
                          <Badge variant="warning">Hidden</Badge>
                        ) : match.isBlind && match.isRevealed ? (
                          <Badge variant="success">Revealed</Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-400">{formatDate(match.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteMatch(match._id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <span className="text-sm text-slate-400">Page {page}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={matches.length < 20}>
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
