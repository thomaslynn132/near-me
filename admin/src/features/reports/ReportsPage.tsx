import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { AlertTriangle, CheckCircle, XCircle, Ban, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Report {
  _id: string;
  reporter: { _id: string; name: string };
  reported: { _id: string; name: string };
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getReports(1, 50, statusFilter || undefined);
      setReports(res.data.data.reports);
    } catch (err) {
      console.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId: string, action: 'resolve' | 'dismiss') => {
    try {
      await adminApi.resolveReport(reportId, action);
      loadReports();
    } catch (err) {
      console.error('Failed to resolve report');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      case 'dismissed':
        return <Badge variant="secondary">Dismissed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Reports</h1>
        <div className="flex gap-2">
          {['', 'pending', 'resolved', 'dismissed'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status || 'All'}
            </Button>
          ))}
        </div>
      </div>

      <Card className="border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Reported Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reports to review</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Reported User</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report._id}>
                    <TableCell className="font-medium">{report.reporter?.name || 'Unknown'}</TableCell>
                    <TableCell className="text-red-400">{report.reported?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge variant="danger">{report.reason}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-slate-400">{report.description}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-slate-400">{formatDate(report.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {report.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleResolve(report._id, 'resolve')}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleResolve(report._id, 'dismiss')}>
                            <XCircle className="w-4 h-4 mr-1" />
                            Dismiss
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Ban className="w-4 h-4 text-yellow-400" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
