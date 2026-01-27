import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import {
  ADMIN_GET_CLASSROOMS,
  ADMIN_UPDATE_CLASSROOM,
  ADMIN_DELETE_CLASSROOM,
  ADMIN_TRANSFER_CLASSROOM,
  ADMIN_GET_USERS,
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
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Building2,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const ITEMS_PER_PAGE = 20

export function ClassroomsPage() {
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [selectedClassroom, setSelectedClassroom] = useState<any>(null)
  const [dialogType, setDialogType] = useState<'edit' | 'delete' | 'transfer' | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    currency: '',
    overdraft: 0,
    transferAcrossClasses: false,
  })
  const [newOwnerId, setNewOwnerId] = useState('')

  const { data, loading, refetch } = useQuery(ADMIN_GET_CLASSROOMS, {
    variables: {
      limit: ITEMS_PER_PAGE,
      offset: (page - 1) * ITEMS_PER_PAGE,
    },
    fetchPolicy: 'network-only',
  })

  const { data: teachersData } = useQuery(ADMIN_GET_USERS, {
    variables: { role: 'TEACHER', limit: 100 },
  })

  const [updateClassroom] = useMutation(ADMIN_UPDATE_CLASSROOM)
  const [deleteClassroom] = useMutation(ADMIN_DELETE_CLASSROOM)
  const [transferClassroom] = useMutation(ADMIN_TRANSFER_CLASSROOM)

  const classrooms = data?.adminClassrooms || []
  const teachers = teachersData?.adminUsers?.nodes || []
  const totalCount = classrooms.length

  const openDialog = (classroom: any, type: 'edit' | 'delete' | 'transfer') => {
    setSelectedClassroom(classroom)
    setDialogType(type)
    if (type === 'edit') {
      setEditForm({
        name: classroom.name || '',
        currency: classroom.settings?.currency || 'CE$',
        overdraft: classroom.settings?.overdraft || 0,
        transferAcrossClasses: classroom.settings?.transferAcrossClasses || false,
      })
    }
    if (type === 'transfer') {
      setNewOwnerId('')
    }
  }

  const closeDialog = () => {
    setDialogType(null)
    setSelectedClassroom(null)
  }

  const handleUpdateClassroom = async () => {
    try {
      await updateClassroom({
        variables: {
          classroomId: selectedClassroom.id,
          input: {
            name: editForm.name,
            settings: {
              currency: editForm.currency,
              overdraft: editForm.overdraft,
              transferAcrossClasses: editForm.transferAcrossClasses,
            },
          },
        },
      })
      toast({ title: 'Classroom Updated', description: 'Classroom has been updated successfully' })
      refetch()
      closeDialog()
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    }
  }

  const handleDeleteClassroom = async (hard: boolean) => {
    try {
      await deleteClassroom({ variables: { classroomId: selectedClassroom.id, hard } })
      toast({
        title: hard ? 'Classroom Deleted' : 'Classroom Archived',
        description: `${selectedClassroom.name} has been ${hard ? 'permanently deleted' : 'archived'}`,
      })
      refetch()
      closeDialog()
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    }
  }

  const handleTransferOwnership = async () => {
    if (!newOwnerId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a new owner' })
      return
    }
    try {
      await transferClassroom({
        variables: { classroomId: selectedClassroom.id, newOwnerId },
      })
      toast({ title: 'Ownership Transferred', description: 'Classroom ownership has been transferred' })
      refetch()
      closeDialog()
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
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
          <h1 className="text-3xl font-bold tracking-tight">Classroom Management</h1>
          <p className="text-muted-foreground">
            View and manage all classrooms
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Classrooms Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Classrooms ({totalCount})
          </CardTitle>
          <CardDescription>
            Classrooms are containers for multiple classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : classrooms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No classrooms found</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Owner ID</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Overdraft</TableHead>
                    <TableHead>Cross-Class Transfer</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classrooms.map((classroom: any) => (
                    <TableRow key={classroom.id}>
                      <TableCell className="font-medium">{classroom.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {classroom.ownerId?.substring(0, 12)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{classroom.settings?.currency || 'CE$'}</Badge>
                      </TableCell>
                      <TableCell>{classroom.settings?.overdraft ?? 0}</TableCell>
                      <TableCell>
                        {classroom.settings?.transferAcrossClasses ? (
                          <Badge variant="success">Enabled</Badge>
                        ) : (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(classroom.createdAt)}</TableCell>
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
                            <DropdownMenuItem onClick={() => openDialog(classroom, 'edit')}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Classroom
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDialog(classroom, 'transfer')}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Transfer Ownership
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openDialog(classroom, 'delete')}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Classroom
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-end mt-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">Page {page}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={classrooms.length < ITEMS_PER_PAGE}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Classroom Dialog */}
      <Dialog open={dialogType === 'edit'} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Classroom</DialogTitle>
            <DialogDescription>Update classroom settings</DialogDescription>
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
              <Label htmlFor="edit-currency">Currency Symbol</Label>
              <Input
                id="edit-currency"
                value={editForm.currency}
                onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                placeholder="CE$"
              />
            </div>
            <div>
              <Label htmlFor="edit-overdraft">Overdraft Limit</Label>
              <Input
                id="edit-overdraft"
                type="number"
                value={editForm.overdraft}
                onChange={(e) => setEditForm({ ...editForm, overdraft: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Cross-Class Transfers</Label>
                <p className="text-sm text-muted-foreground">
                  Allow students to transfer currency between classes
                </p>
              </div>
              <Switch
                checked={editForm.transferAcrossClasses}
                onCheckedChange={(checked) => setEditForm({ ...editForm, transferAcrossClasses: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleUpdateClassroom}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Classroom Dialog */}
      <Dialog open={dialogType === 'delete'} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Classroom</DialogTitle>
            <DialogDescription>
              Choose how to delete {selectedClassroom?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong>Soft Delete:</strong> Archives all classes in this classroom.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Hard Delete:</strong> Permanently removes the classroom and all its classes, memberships, and accounts. This cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button variant="secondary" onClick={() => handleDeleteClassroom(false)}>Archive</Button>
            <Button variant="destructive" onClick={() => handleDeleteClassroom(true)}>Delete Permanently</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Ownership Dialog */}
      <Dialog open={dialogType === 'transfer'} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Ownership</DialogTitle>
            <DialogDescription>
              Transfer {selectedClassroom?.name} to another teacher.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>New Owner</Label>
            <Select value={newOwnerId} onValueChange={setNewOwnerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a teacher..." />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher: any) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleTransferOwnership}>Transfer Ownership</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
