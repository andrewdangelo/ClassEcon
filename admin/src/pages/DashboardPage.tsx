import { useQuery } from '@apollo/client'
import { GET_ADMIN_DASHBOARD_STATS, GET_ADMIN_SUBSCRIPTION_STATS, ADMIN_GET_USERS, ADMIN_GET_CLASSES, ADMIN_GET_AUDIT_LOGS } from '@/graphql/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Activity,
  Ban,
  BookOpen,
  Key,
  Clock,
  CreditCard,
  Crown,
} from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ElementType
  trend?: string
  trendUp?: boolean
  loading?: boolean
}

function StatCard({ title, value, description, icon: Icon, trend, trendUp, loading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? <span className="animate-pulse">...</span> : value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p className={`text-xs ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const { data: statsData, loading: statsLoading } = useQuery(GET_ADMIN_DASHBOARD_STATS, {
    fetchPolicy: 'network-only',
  })

  const { data: subscriptionData, loading: subscriptionLoading } = useQuery(GET_ADMIN_SUBSCRIPTION_STATS, {
    fetchPolicy: 'network-only',
  })

  const { data: usersData, loading: usersLoading } = useQuery(ADMIN_GET_USERS, {
    variables: { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' },
    fetchPolicy: 'network-only',
  })

  const { data: classesData, loading: classesLoading } = useQuery(ADMIN_GET_CLASSES, {
    variables: { limit: 5 },
    fetchPolicy: 'network-only',
  })

  const { data: auditData, loading: auditLoading } = useQuery(ADMIN_GET_AUDIT_LOGS, {
    variables: { limit: 10 },
    fetchPolicy: 'network-only',
  })

  const stats = statsData?.adminDashboardStats
  const subscriptionStats = subscriptionData?.adminSubscriptionStats
  const recentUsers = usersData?.adminUsers?.nodes || []
  const recentClasses = classesData?.adminClasses || []
  const auditLogs = auditData?.adminAuditLogs?.nodes || []

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('BAN')) return 'destructive'
    if (action.includes('DELETE')) return 'destructive'
    if (action.includes('GRANT') || action.includes('RESTORE')) return 'success'
    if (action.includes('UPDATE')) return 'secondary'
    return 'outline'
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Complete overview of the ClassEcon platform
        </p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          description={`${stats?.activeUsers ?? 0} active`}
          icon={Users}
          loading={statsLoading}
        />
        <StatCard
          title="Teachers"
          value={stats?.totalTeachers ?? 0}
          description="Teaching accounts"
          icon={GraduationCap}
          loading={statsLoading}
        />
        <StatCard
          title="Students"
          value={stats?.totalStudents ?? 0}
          description="Student accounts"
          icon={BookOpen}
          loading={statsLoading}
        />
        <StatCard
          title="Admins"
          value={stats?.totalAdmins ?? 0}
          description="Administrator accounts"
          icon={ShieldCheck}
          loading={statsLoading}
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="New Users Today"
          value={stats?.newUsersToday ?? 0}
          description={`${stats?.newUsersThisWeek ?? 0} this week`}
          icon={UserPlus}
          loading={statsLoading}
          trend={stats?.newUsersThisMonth ? `${stats.newUsersThisMonth} this month` : undefined}
          trendUp={true}
        />
        <StatCard
          title="Total Classes"
          value={stats?.totalClasses ?? 0}
          description={`${stats?.activeClasses ?? 0} active, ${stats?.archivedClasses ?? 0} archived`}
          icon={GraduationCap}
          loading={statsLoading}
        />
        <StatCard
          title="Banned Users"
          value={stats?.bannedUsers ?? 0}
          description={`${stats?.disabledUsers ?? 0} disabled`}
          icon={Ban}
          loading={statsLoading}
        />
        <StatCard
          title="Beta Codes"
          value={stats?.totalBetaCodes ?? 0}
          description={`${stats?.activeBetaCodes ?? 0} active, ${stats?.totalBetaCodeUses ?? 0} uses`}
          icon={Key}
          loading={statsLoading}
        />
      </div>

      {/* Subscription Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Subscriptions"
          value={subscriptionStats?.totalSubscriptions ?? 0}
          description="All teacher accounts"
          icon={CreditCard}
          loading={subscriptionLoading}
        />
        <StatCard
          title="Active Paid"
          value={subscriptionStats?.activeSubscriptions ?? 0}
          description={`${subscriptionStats?.trialSubscriptions ?? 0} on trial`}
          icon={TrendingUp}
          loading={subscriptionLoading}
        />
        <StatCard
          title="Founding Members"
          value={subscriptionStats?.foundingMembers ?? 0}
          description="Lifetime 50% discount"
          icon={Crown}
          loading={subscriptionLoading}
        />
        <StatCard
          title="Tier Breakdown"
          value={
            subscriptionStats?.tierBreakdown 
              ? `${subscriptionStats.tierBreakdown.PROFESSIONAL || 0} Pro / ${subscriptionStats.tierBreakdown.STARTER || 0} Starter`
              : '0 Pro / 0 Starter'
          }
          description={`${subscriptionStats?.expiredSubscriptions ?? 0} expired, ${subscriptionStats?.cancelledSubscriptions ?? 0} cancelled`}
          icon={Activity}
          loading={subscriptionLoading}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Recent Users
            </CardTitle>
            <CardDescription>
              Latest registered accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : recentUsers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No users yet</div>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                        {user.role}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(user.status)} className="text-xs">
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Recent Classes
            </CardTitle>
            <CardDescription>
              Latest classes created
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classesLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : recentClasses.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No classes yet</div>
            ) : (
              <div className="space-y-3">
                {recentClasses.map((cls: any) => (
                  <div key={cls.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{cls.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {cls.schoolName || 'No school'} • {cls.joinCode}
                      </p>
                    </div>
                    <Badge variant={cls.isArchived ? 'secondary' : 'success'} className="ml-2">
                      {cls.isArchived ? 'Archived' : 'Active'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Audit Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Admin Activity
            </CardTitle>
            <CardDescription>
              Recent admin actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {auditLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No activity yet</div>
            ) : (
              <div className="space-y-3">
                {auditLogs.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getActionBadgeVariant(log.action)} className="text-xs">
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {log.adminUser?.name || 'Unknown'} • {log.targetType}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                      <Clock className="h-3 w-3" />
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Platform Statistics
          </CardTitle>
          <CardDescription>
            Comprehensive platform metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats?.totalClassrooms ?? 0}</p>
              <p className="text-xs text-muted-foreground">Classrooms</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats?.totalParents ?? 0}</p>
              <p className="text-xs text-muted-foreground">Parents</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats?.activeClasses ?? 0}</p>
              <p className="text-xs text-muted-foreground">Active Classes</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats?.activeBetaCodes ?? 0}</p>
              <p className="text-xs text-muted-foreground">Active Beta Codes</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats?.newUsersThisWeek ?? 0}</p>
              <p className="text-xs text-muted-foreground">New This Week</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats?.newUsersThisMonth ?? 0}</p>
              <p className="text-xs text-muted-foreground">New This Month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
