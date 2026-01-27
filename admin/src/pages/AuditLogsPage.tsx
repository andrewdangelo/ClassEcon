import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { ADMIN_GET_AUDIT_LOGS } from '@/graphql/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Activity,
  Eye,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const ITEMS_PER_PAGE = 25

const ACTION_TYPES = [
  'BAN_USER',
  'UNBAN_USER',
  'UPDATE_USER',
  'SOFT_DELETE_USER',
  'HARD_DELETE_USER',
  'RESET_USER_PASSWORD',
  'GRANT_BETA_ACCESS',
  'REVOKE_BETA_ACCESS',
  'IMPERSONATE_USER',
  'UPDATE_CLASSROOM',
  'SOFT_DELETE_CLASSROOM',
  'HARD_DELETE_CLASSROOM',
  'TRANSFER_CLASSROOM_OWNERSHIP',
  'FORCE_DELETE_CLASS',
  'RESTORE_CLASS',
  'PURGE_INACTIVE_USERS',
  'SEND_BULK_EMAIL',
]

const TARGET_TYPES = [
  'User',
  'Classroom',
  'Class',
  'System',
]

export function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all')
  const [selectedLog, setSelectedLog] = useState<any>(null)

  const { data, loading, refetch } = useQuery(ADMIN_GET_AUDIT_LOGS, {
    variables: {
      action: actionFilter !== 'all' ? actionFilter : undefined,
      targetType: targetTypeFilter !== 'all' ? targetTypeFilter : undefined,
      limit: ITEMS_PER_PAGE,
      offset: (page - 1) * ITEMS_PER_PAGE,
    },
    fetchPolicy: 'network-only',
  })

  const logs = data?.adminAuditLogs?.nodes || []
  const totalCount = data?.adminAuditLogs?.totalCount || 0
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('BAN') || action.includes('DELETE') || action.includes('PURGE')) return 'destructive'
    if (action.includes('GRANT') || action.includes('RESTORE') || action.includes('UNBAN')) return 'success'
    if (action.includes('UPDATE') || action.includes('TRANSFER')) return 'secondary'
    if (action.includes('IMPERSONATE') || action.includes('RESET')) return 'outline'
    return 'default'
  }

  const getTargetTypeBadge = (targetType: string) => {
    switch (targetType) {
      case 'User': return 'default'
      case 'Classroom': return 'secondary'
      case 'Class': return 'outline'
      case 'System': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track all administrative actions
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter audit log entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-[200px]">
              <Label>Action Type</Label>
              <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1) }}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {ACTION_TYPES.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[150px]">
              <Label>Target Type</Label>
              <Select value={targetTypeFilter} onValueChange={(v) => { setTargetTypeFilter(v); setPage(1) }}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {TARGET_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Entries ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No audit logs found</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target Type</TableHead>
                    <TableHead>Target ID</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.adminUser?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{log.adminUser?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTargetTypeBadge(log.targetType)}>
                          {log.targetType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {log.targetId?.substring(0, 12)}...
                        </code>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.ipAddress || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, totalCount)} of {totalCount}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p - 1)}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {page} of {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Complete information for this audit entry
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Log ID</Label>
                  <p className="font-mono text-sm">{selectedLog.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Timestamp</Label>
                  <p>{formatDate(selectedLog.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Admin User</Label>
                  <p>{selectedLog.adminUser?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{selectedLog.adminUser?.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Admin User ID</Label>
                  <p className="font-mono text-sm">{selectedLog.adminUserId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Action</Label>
                  <Badge variant={getActionBadgeVariant(selectedLog.action)}>
                    {selectedLog.action.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Target Type</Label>
                  <Badge variant={getTargetTypeBadge(selectedLog.targetType)}>
                    {selectedLog.targetType}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Target ID</Label>
                  <p className="font-mono text-sm">{selectedLog.targetId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">IP Address</Label>
                  <p className="font-mono text-sm">{selectedLog.ipAddress || 'N/A'}</p>
                </div>
              </div>
              
              {selectedLog.userAgent && (
                <div>
                  <Label className="text-muted-foreground">User Agent</Label>
                  <p className="text-xs font-mono bg-muted p-2 rounded mt-1 break-all">
                    {selectedLog.userAgent}
                  </p>
                </div>
              )}

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Details</Label>
                  <pre className="text-xs bg-muted p-3 rounded mt-1 overflow-auto max-h-60">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
