import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { CREATE_BETA_CODE, DEACTIVATE_BETA_CODE } from '@/graphql/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Key, MoreHorizontal, Copy, XCircle, CheckCircle } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'

interface BetaCode {
  id: string
  code: string
  description: string
  maxUses: number
  currentUses: number
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

export function BetaCodesPage() {
  const [codes, setCodes] = useState<BetaCode[]>([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newMaxUses, setNewMaxUses] = useState('50')
  const [newExpiresAt, setNewExpiresAt] = useState('')
  const { toast } = useToast()

  const [createBetaCode, { loading: creating }] = useMutation(CREATE_BETA_CODE, {
    onCompleted: (data) => {
      const code = data.createBetaCode
      setCodes((prev) => [code, ...prev])
      toast({ title: 'Beta code created successfully!' })
      setCreateDialogOpen(false)
      resetForm()
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to create beta code',
        description: error.message,
      })
    },
  })

  const [deactivateBetaCode] = useMutation(DEACTIVATE_BETA_CODE, {
    onCompleted: (data) => {
      const updated = data.deactivateBetaCode
      setCodes((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, isActive: updated.isActive } : c))
      )
      toast({ title: 'Beta code deactivated' })
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to deactivate code',
        description: error.message,
      })
    },
  })

  const resetForm = () => {
    setNewCode('')
    setNewDescription('')
    setNewMaxUses('50')
    setNewExpiresAt('')
  }

  const handleCreateCode = () => {
    if (!newCode.trim()) {
      toast({ variant: 'destructive', title: 'Please enter a code' })
      return
    }

    createBetaCode({
      variables: {
        code: newCode.trim().toUpperCase(),
        description: newDescription || undefined,
        maxUses: parseInt(newMaxUses) || 50,
        expiresAt: newExpiresAt ? new Date(newExpiresAt).toISOString() : undefined,
      },
    })
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({ title: 'Code copied to clipboard!' })
  }

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'BETA'
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewCode(code)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beta Access Codes</h1>
          <p className="text-muted-foreground">
            Create and manage beta access codes for early testers
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Beta Access Code</DialogTitle>
              <DialogDescription>
                Create a new beta access code for early testers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    placeholder="BETA2024"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    className="uppercase"
                  />
                  <Button type="button" variant="outline" onClick={generateRandomCode}>
                    Generate
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="Early testers batch 1"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Max Uses</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expires At (optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={newExpiresAt}
                    onChange={(e) => setNewExpiresAt(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCode} disabled={creating}>
                {creating ? 'Creating...' : 'Create Code'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{codes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {codes.filter((c) => c.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {codes.reduce((acc, c) => acc + c.currentUses, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Beta Codes</CardTitle>
          <CardDescription>
            Manage your beta access codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No beta codes created yet</p>
              <p className="text-sm">Click "Create Code" to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded font-mono">
                          {code.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyCode(code.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{code.description || '-'}</TableCell>
                    <TableCell>
                      {code.currentUses} / {code.maxUses}
                    </TableCell>
                    <TableCell>
                      {code.expiresAt ? formatDateTime(code.expiresAt) : 'Never'}
                    </TableCell>
                    <TableCell>
                      {code.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(code.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => copyCode(code.code)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Code
                          </DropdownMenuItem>
                          {code.isActive && (
                            <DropdownMenuItem
                              onClick={() => deactivateBetaCode({ variables: { id: code.id } })}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          )}
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

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>Beta access codes allow users to sign up for early access to the platform.</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Create a code with a memorable name (e.g., BETA2024, EARLYBIRD)</li>
            <li>Set max uses to limit how many people can use each code</li>
            <li>Optionally set an expiration date</li>
            <li>Share the code with your beta testers</li>
            <li>Users enter the code during signup to get beta access</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
