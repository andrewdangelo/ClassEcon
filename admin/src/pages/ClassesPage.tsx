import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { GET_ALL_CLASSES, DELETE_CLASS, UPDATE_CLASS } from '@/graphql/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Search, MoreHorizontal, Eye, Archive, Trash2, RotateCcw, Copy } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Class {
  id: string
  classroomId: string
  name: string
  slug: string
  description: string
  subject: string
  period: string
  gradeLevel: number
  joinCode: string
  schoolName: string
  district: string
  defaultCurrency: string
  startingBalance: number
  status: string
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export function ClassesPage() {
  const [search, setSearch] = useState('')
  const [includeArchived, setIncludeArchived] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [classToDelete, setClassToDelete] = useState<Class | null>(null)
  const { toast } = useToast()

  const { data, loading, refetch } = useQuery(GET_ALL_CLASSES, {
    variables: { includeArchived },
    fetchPolicy: 'cache-and-network',
  })

  const [deleteClass, { loading: deleting }] = useMutation(DELETE_CLASS, {
    onCompleted: () => {
      toast({ title: 'Class deleted successfully' })
      setDeleteDialogOpen(false)
      setClassToDelete(null)
      refetch()
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Failed to delete class', description: error.message })
    },
  })

  const [updateClass] = useMutation(UPDATE_CLASS, {
    onCompleted: () => {
      toast({ title: 'Class updated successfully' })
      refetch()
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Failed to update class', description: error.message })
    },
  })

  const classes: Class[] = data?.classes || []

  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(search.toLowerCase()) ||
    cls.schoolName?.toLowerCase().includes(search.toLowerCase()) ||
    cls.joinCode?.toLowerCase().includes(search.toLowerCase())
  )

  const handleArchiveToggle = (cls: Class) => {
    updateClass({
      variables: {
        id: cls.id,
        input: { isArchived: !cls.isArchived },
      },
    })
  }

  const handleDeleteClass = () => {
    if (classToDelete) {
      deleteClass({ variables: { id: classToDelete.id, hard: true } })
    }
  }

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({ title: 'Join code copied!' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
        <p className="text-muted-foreground">
          Manage all classes on the platform
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, school, or join code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-archived"
                  checked={includeArchived}
                  onCheckedChange={setIncludeArchived}
                />
                <Label htmlFor="include-archived">Include archived</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Classes ({filteredClasses.length})</CardTitle>
          <CardDescription>
            A list of all classes created on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredClasses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No classes found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Join Code</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">
                      {cls.name}
                      {cls.period && (
                        <span className="text-muted-foreground ml-2">P{cls.period}</span>
                      )}
                    </TableCell>
                    <TableCell>{cls.schoolName || '-'}</TableCell>
                    <TableCell>{cls.subject || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {cls.joinCode}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyJoinCode(cls.joinCode)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{cls.defaultCurrency || 'CE$'}</TableCell>
                    <TableCell>
                      {cls.isArchived ? (
                        <Badge variant="secondary">Archived</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(cls.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedClass(cls)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleArchiveToggle(cls)}>
                            {cls.isArchived ? (
                              <>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Restore
                              </>
                            ) : (
                              <>
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setClassToDelete(cls)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Class Details Dialog */}
      <Dialog open={!!selectedClass} onOpenChange={() => setSelectedClass(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Class Details</DialogTitle>
            <DialogDescription>
              Detailed information about the class
            </DialogDescription>
          </DialogHeader>
          {selectedClass && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedClass.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Join Code</p>
                  <code className="bg-muted px-2 py-1 rounded">{selectedClass.joinCode}</code>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">School</p>
                  <p>{selectedClass.schoolName || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">District</p>
                  <p>{selectedClass.district || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subject</p>
                  <p>{selectedClass.subject || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Period</p>
                  <p>{selectedClass.period || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Grade Level</p>
                  <p>{selectedClass.gradeLevel || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Currency</p>
                  <p>{selectedClass.defaultCurrency || 'CE$'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Starting Balance</p>
                  <p>{selectedClass.startingBalance ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  {selectedClass.isArchived ? (
                    <Badge variant="secondary">Archived</Badge>
                  ) : (
                    <Badge variant="success">Active</Badge>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p>{selectedClass.description || 'No description'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Class ID</p>
                  <p className="font-mono text-sm">{selectedClass.id}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Class</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete "{classToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteClass} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
