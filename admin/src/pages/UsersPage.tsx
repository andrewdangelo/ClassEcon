import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import {
  ADMIN_GET_USERS,
  ADMIN_GET_USER,
  ADMIN_BAN_USER,
  ADMIN_UNBAN_USER,
  ADMIN_UPDATE_USER,
  ADMIN_DELETE_USER,
  ADMIN_RESET_USER_PASSWORD,
  ADMIN_GRANT_BETA_ACCESS,
  ADMIN_REVOKE_BETA_ACCESS,
  ADMIN_IMPERSONATE_USER,
} from '@/graphql/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  Search,
  MoreHorizontal,
  Ban,
  CheckCircle,
  Edit,
  Trash2,
  Key,
  Shield,
  UserCog,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'

const ITEMS_PER_PAGE = 20

export function UsersPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [dialogType, setDialogType] = useState<'view' | 'edit' | 'ban' | 'delete' | 'password' | null>(null)
  
  // Form state
  const [banReason, setBanReason] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    status: '',
    hasBetaAccess: false,
    subscriptionTier: '',
    isFoundingMember: false,
  })

  const { data, loading, refetch } = useQuery(ADMIN_GET_USERS, {
    variables: {
      search: search || undefined,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      limit: ITEMS_PER_PAGE,
      offset: (page - 1) * ITEMS_PER_PAGE,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    fetchPolicy: 'network-only',
  })

  const { refetch: refetchUser } = useQuery(ADMIN_GET_USER, {
    variables: { id: selectedUser?.id },
    skip: !selectedUser?.id,
  })

  const [banUser] = useMutation(ADMIN_BAN_USER)
  const [unbanUser] = useMutation(ADMIN_UNBAN_USER)
  const [updateUser] = useMutation(ADMIN_UPDATE_USER)
  const [deleteUser] = useMutation(ADMIN_DELETE_USER)
  const [resetPassword] = useMutation(ADMIN_RESET_USER_PASSWORD)
  const [grantBetaAccess] = useMutation(ADMIN_GRANT_BETA_ACCESS)
  const [revokeBetaAccess] = useMutation(ADMIN_REVOKE_BETA_ACCESS)
  const [impersonateUser] = useMutation(ADMIN_IMPERSONATE_USER)

  const users = data?.adminUsers?.nodes || []
  const totalCount = data?.adminUsers?.totalCount || 0
  const pageInfo = data?.adminUsers?.pageInfo

  const openDialog = (user: any, type: 'view' | 'edit' | 'ban' | 'delete' | 'password') => {
    setSelectedUser(user)
    setDialogType(type)
    if (type === 'edit') {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        status: user.status || '',
        hasBetaAccess: user.hasBetaAccess || false,
        subscriptionTier: user.subscriptionTier || 'FREE',
        isFoundingMember: user.isFoundingMember || false,
      })
    }
    if (type === 'ban') {
      setBanReason('')
    }
    if (type === 'password') {
      setNewPassword('')
    }
  }

  const closeDialog = () => {
    setDialogType(null)
    setSelectedUser(null)
  }

  const handleBanUser = async () => {
    if (!banReason.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Ban reason is required' })
      return
    }
    try {
      await banUser({ variables: { userId: selectedUser.id, reason: banReason } })
      toast({ title: 'User Banned', description: `${selectedUser.name} has been banned` })
      refetch()
      closeDialog()
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    }
  }

  const handleUnbanUser = async (user: any) => {
    try {
      await unbanUser({ variables: { userId: user.id } })
      toast({ title: 'User Unbanned', description: `${user.name} has been unbanned` })
      refetch()
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    }
  }

  const handleUpdateUser = async () => {
    try {
      await updateUser({
        variables: {
          userId: selectedUser.id,
          input: editForm,
        },
      })
      toast({ title: 'User Updated', description: `${selectedUser.name} has been updated` })
      refetch()
      closeDialog()
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    }
  }

  const handleDeleteUser = async (hard: boolean) => {
    try {
      await deleteUser({ variables: { userId: selectedUser.id, hard } })
      toast({
        title: hard ? 'User Deleted' : 'User Disabled',
        description: `${selectedUser.name} has been ${hard ? 'permanently deleted' : 'disabled'}`,
      })
      refetch()
      closeDialog()
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    }
  }

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 8 characters' })
      return
    }
    try {
      await resetPassword({ variables: { userId: selectedUser.id, newPassword } })
      toast({ title: 'Password Reset', description: `Password for ${selectedUser.name} has been reset` })
      closeDialog()
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    }
  }

  const handleToggleBetaAccess = async (user: any) => {
    try {
      if (user.hasBetaAccess) {
        await revokeBetaAccess({ variables: { userId: user.id } })
        toast({ title: 'Beta Access Revoked', description: `${user.name} no longer has beta access` })
      } else {
        await grantBetaAccess({ variables: { userId: user.id } })
        toast({ title: 'Beta Access Granted', description: `${user.name} now has beta access` })
      }
      refetch()
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    }
  }

  const handleImpersonate = async (user: any) => {
    try {
      const { data } = await impersonateUser({ variables: { userId: user.id } })
      if (data?.adminImpersonateUser) {
        toast({
          title: 'Impersonation Token Generated',
          description: `Token for ${user.name} copied to clipboard. Use it in the main app.`,
        })
        navigator.clipboard.writeText(data.adminImpersonateUser.accessToken)
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'destructive'
      case 'TEACHER': return 'default'
      case 'STUDENT': return 'secondary'
      case 'PARENT': return 'outline'
      default: return 'secondary'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success'
      case 'BANNED': return 'destructive'
      case 'DISABLED': return 'secondary'
      case 'INVITED': return 'outline'
      default: return 'secondary'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            View and manage all user accounts
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
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-[150px]">
              <Label>Role</Label>
              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1) }}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="PARENT">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[150px]">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="BANNED">Banned</SelectItem>
                  <SelectItem value="DISABLED">Disabled</SelectItem>
                  <SelectItem value="INVITED">Invited</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No users found</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Beta</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.hasBetaAccess ? (
                          <Badge variant="success">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.subscriptionTier}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDialog(user, 'view')}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDialog(user, 'edit')}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDialog(user, 'password')}>
                              <Key className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleBetaAccess(user)}>
                              <Shield className="h-4 w-4 mr-2" />
                              {user.hasBetaAccess ? 'Revoke Beta' : 'Grant Beta'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleImpersonate(user)}>
                              <UserCog className="h-4 w-4 mr-2" />
                              Impersonate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === 'BANNED' ? (
                              <DropdownMenuItem onClick={() => handleUnbanUser(user)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Unban User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => openDialog(user, 'ban')}
                                className="text-orange-600"
                                disabled={user.role === 'ADMIN'}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Ban User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => openDialog(user, 'delete')}
                              className="text-destructive"
                              disabled={user.role === 'ADMIN'}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                    disabled={!pageInfo?.hasPreviousPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pageInfo?.currentPage || 1} of {pageInfo?.totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={!pageInfo?.hasNextPage}
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

      {/* View User Dialog */}
      <Dialog open={dialogType === 'view'} onOpenChange={() => closeDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Complete information for {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">ID</Label>
                <p className="font-mono text-sm">{selectedUser.id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p>{selectedUser.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p>{selectedUser.email || '—'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Role</Label>
                <Badge variant={getRoleBadgeVariant(selectedUser.role)}>{selectedUser.role}</Badge>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <Badge variant={getStatusBadgeVariant(selectedUser.status)}>{selectedUser.status}</Badge>
              </div>
              <div>
                <Label className="text-muted-foreground">Beta Access</Label>
                <p>{selectedUser.hasBetaAccess ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Subscription Tier</Label>
                <p>{selectedUser.subscriptionTier}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Subscription Status</Label>
                <p>{selectedUser.subscriptionStatus}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Founding Member</Label>
                <p>{selectedUser.isFoundingMember ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Created At</Label>
                <p>{formatDate(selectedUser.createdAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={dialogType === 'edit'} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="PARENT">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DISABLED">Disabled</SelectItem>
                  <SelectItem value="INVITED">Invited</SelectItem>
                  <SelectItem value="BANNED">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subscription Tier</Label>
              <Select value={editForm.subscriptionTier} onValueChange={(v) => setEditForm({ ...editForm, subscriptionTier: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="TRIAL">Trial</SelectItem>
                  <SelectItem value="STARTER">Starter</SelectItem>
                  <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                  <SelectItem value="SCHOOL">School</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={dialogType === 'ban'} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to ban {selectedUser?.name}? They will not be able to log in.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="ban-reason">Reason for ban</Label>
            <Input
              id="ban-reason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Enter reason for banning this user..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button variant="destructive" onClick={handleBanUser}>Ban User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={dialogType === 'delete'} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Choose how to delete {selectedUser?.name}'s account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong>Soft Delete:</strong> Disables the account but keeps data for recovery.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Hard Delete:</strong> Permanently removes all user data. This cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button variant="secondary" onClick={() => handleDeleteUser(false)}>Soft Delete</Button>
            <Button variant="destructive" onClick={() => handleDeleteUser(true)}>Hard Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={dialogType === 'password'} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 8 characters)..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleResetPassword}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
