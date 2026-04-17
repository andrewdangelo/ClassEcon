// src/pages/SubscriptionManagementPage.tsx
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { format } from 'date-fns';
import { 
  Search, 
  UserCircle, 
  CreditCard, 
  Calendar, 
  Star, 
  AlertCircle,
  RefreshCw,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

// GraphQL Queries and Mutations
const ADMIN_SUBSCRIPTION_STATS = gql`
  query AdminSubscriptionStats {
    adminSubscriptionStats {
      totalSubscriptions
      activeSubscriptions
      trialSubscriptions
      expiredSubscriptions
      cancelledSubscriptions
      foundingMembers
      tierBreakdown
    }
  }
`;

const ADMIN_SEARCH_USERS = gql`
  query AdminUsers($search: String, $limit: Int, $offset: Int) {
    adminUsers(search: $search, limit: $limit, offset: $offset) {
      users {
        id
        name
        email
        subscriptionTier
        subscriptionStatus
        subscriptionExpiresAt
        trialEndsAt
        isFoundingMember
        stripeCustomerId
        stripeSubscriptionId
        createdAt
      }
      total
    }
  }
`;

const ADMIN_UPDATE_SUBSCRIPTION = gql`
  mutation AdminUpdateSubscription($userId: ID!, $input: AdminSubscriptionInput!) {
    adminUpdateSubscription(userId: $userId, input: $input) {
      id
      subscriptionTier
      subscriptionStatus
      subscriptionExpiresAt
      isFoundingMember
    }
  }
`;

const ADMIN_CANCEL_SUBSCRIPTION = gql`
  mutation AdminCancelSubscription($userId: ID!, $immediately: Boolean, $reason: String) {
    adminCancelSubscription(userId: $userId, immediately: $immediately, reason: $reason) {
      id
      subscriptionStatus
    }
  }
`;

const ADMIN_EXTEND_TRIAL = gql`
  mutation AdminExtendTrial($userId: ID!, $days: Int!) {
    adminExtendTrial(userId: $userId, days: $days) {
      id
      trialEndsAt
    }
  }
`;

const ADMIN_GRANT_FOUNDING_MEMBER = gql`
  mutation AdminGrantFoundingMember($userId: ID!) {
    adminGrantFoundingMember(userId: $userId) {
      id
      isFoundingMember
    }
  }
`;

const ADMIN_REVOKE_FOUNDING_MEMBER = gql`
  mutation AdminRevokeFoundingMember($userId: ID!) {
    adminRevokeFoundingMember(userId: $userId) {
      id
      isFoundingMember
    }
  }
`;

interface User {
  id: string;
  name: string;
  email: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  subscriptionExpiresAt: string | null;
  trialEndsAt: string | null;
  isFoundingMember: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
}

export function SubscriptionManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showExtendTrialModal, setShowExtendTrialModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [trialDays, setTrialDays] = useState(7);
  const [editForm, setEditForm] = useState({
    subscriptionTier: '',
    subscriptionStatus: '',
  });

  // Queries
  const { data: statsData, loading: statsLoading } = useQuery(ADMIN_SUBSCRIPTION_STATS);
  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useQuery(ADMIN_SEARCH_USERS, {
    variables: { search: searchQuery, limit: 20, offset: 0 },
    skip: !searchQuery,
  });

  // Mutations
  const [updateSubscription, { loading: updating }] = useMutation(ADMIN_UPDATE_SUBSCRIPTION, {
    onCompleted: () => {
      setShowEditModal(false);
      refetchUsers();
    },
  });

  const [cancelSubscription, { loading: cancelling }] = useMutation(ADMIN_CANCEL_SUBSCRIPTION, {
    onCompleted: () => {
      setShowCancelModal(false);
      refetchUsers();
    },
  });

  const [extendTrial, { loading: extending }] = useMutation(ADMIN_EXTEND_TRIAL, {
    onCompleted: () => {
      setShowExtendTrialModal(false);
      refetchUsers();
    },
  });

  const [grantFoundingMember] = useMutation(ADMIN_GRANT_FOUNDING_MEMBER, {
    onCompleted: () => refetchUsers(),
  });

  const [revokeFoundingMember] = useMutation(ADMIN_REVOKE_FOUNDING_MEMBER, {
    onCompleted: () => refetchUsers(),
  });

  const stats = statsData?.adminSubscriptionStats;
  const users = usersData?.adminUsers?.users || [];

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      FREE: 'bg-gray-500',
      TRIAL: 'bg-blue-500',
      STARTER: 'bg-green-500',
      PROFESSIONAL: 'bg-purple-500',
      SCHOOL: 'bg-amber-500',
    };
    return <Badge className={colors[tier] || 'bg-gray-500'}>{tier}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-500',
      TRIALING: 'bg-blue-500',
      PAST_DUE: 'bg-yellow-500',
      CANCELLED: 'bg-red-500',
      EXPIRED: 'bg-gray-500',
    };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status}</Badge>;
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    await updateSubscription({
      variables: {
        userId: selectedUser.id,
        input: {
          subscriptionTier: editForm.subscriptionTier,
          subscriptionStatus: editForm.subscriptionStatus,
        },
      },
    });
  };

  const handleCancelClick = (user: User) => {
    setSelectedUser(user);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedUser) return;
    await cancelSubscription({
      variables: {
        userId: selectedUser.id,
        immediately: false,
        reason: cancelReason || undefined,
      },
    });
  };

  const handleExtendTrialClick = (user: User) => {
    setSelectedUser(user);
    setTrialDays(7);
    setShowExtendTrialModal(true);
  };

  const handleConfirmExtendTrial = async () => {
    if (!selectedUser) return;
    await extendTrial({
      variables: {
        userId: selectedUser.id,
        days: trialDays,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
        <p className="text-muted-foreground">
          Manage customer subscriptions and provide support
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSubscriptions || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.trialSubscriptions || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.cancelledSubscriptions || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.expiredSubscriptions || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Founding</CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.foundingMembers || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Search and Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Subscription Lookup</CardTitle>
          <CardDescription>Search for users to manage their subscriptions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => refetchUsers()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {usersLoading && (
            <div className="text-center py-8 text-muted-foreground">Searching...</div>
          )}

          {!usersLoading && users.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Founding</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getTierBadge(user.subscriptionTier)}</TableCell>
                    <TableCell>{getStatusBadge(user.subscriptionStatus)}</TableCell>
                    <TableCell>
                      {user.subscriptionExpiresAt
                        ? format(new Date(user.subscriptionExpiresAt), 'MMM d, yyyy')
                        : user.trialEndsAt
                        ? format(new Date(user.trialEndsAt), 'MMM d, yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {user.isFoundingMember && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700">
                          <Star className="h-3 w-3 mr-1" />
                          Founding
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditClick(user)}>
                            Edit Subscription
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExtendTrialClick(user)}>
                            Extend Trial
                          </DropdownMenuItem>
                          {user.isFoundingMember ? (
                            <DropdownMenuItem 
                              onClick={() => revokeFoundingMember({ variables: { userId: user.id } })}
                              className="text-red-600"
                            >
                              Revoke Founding Status
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => grantFoundingMember({ variables: { userId: user.id } })}
                            >
                              Grant Founding Status
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleCancelClick(user)}
                            className="text-red-600"
                          >
                            Cancel Subscription
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!usersLoading && searchQuery && users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching "{searchQuery}"
            </div>
          )}

          {!searchQuery && (
            <Alert>
              <Search className="h-4 w-4" />
              <AlertDescription>
                Enter a name or email to search for users and manage their subscriptions.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Edit Subscription Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Update subscription for {selectedUser?.name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Subscription Tier</Label>
              <Select
                value={editForm.subscriptionTier}
                onValueChange={(value) => setEditForm({ ...editForm, subscriptionTier: value })}
              >
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
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editForm.subscriptionStatus}
                onValueChange={(value) => setEditForm({ ...editForm, subscriptionStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="TRIALING">Trialing</SelectItem>
                  <SelectItem value="PAST_DUE">Past Due</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updating}>
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Cancel subscription for {selectedUser?.name}. This will take effect at the end of the billing period.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cancellation Reason (optional)</Label>
              <Textarea
                placeholder="Enter reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Back
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Trial Modal */}
      <Dialog open={showExtendTrialModal} onOpenChange={setShowExtendTrialModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Trial</DialogTitle>
            <DialogDescription>
              Extend the trial period for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Additional Days</Label>
              <Select
                value={trialDays.toString()}
                onValueChange={(value) => setTrialDays(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendTrialModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmExtendTrial} disabled={extending}>
              {extending ? 'Extending...' : 'Extend Trial'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
