import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'
import { Settings, Shield, Database, Bell, Palette } from 'lucide-react'

export function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your admin dashboard settings
        </p>
      </div>

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your admin account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={user?.name || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div>
                    <Badge variant="default">{user?.role}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subscription</Label>
                  <div>
                    <Badge variant="outline">{user?.subscriptionTier || 'FREE'}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Beta Access</p>
                  <p className="text-sm text-muted-foreground">
                    Access to beta features
                  </p>
                </div>
                <Badge variant={user?.hasBetaAccess ? 'success' : 'secondary'}>
                  {user?.hasBetaAccess ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Founding Member</p>
                  <p className="text-sm text-muted-foreground">
                    Early supporter status
                  </p>
                </div>
                <Badge variant={user?.isFoundingMember ? 'success' : 'secondary'}>
                  {user?.isFoundingMember ? 'Yes' : 'No'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <Button variant="outline">Enable</Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">
                    Update your password
                  </p>
                </div>
                <Button variant="outline">Change</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme
              </CardTitle>
              <CardDescription>
                Customize the appearance of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Toggle dark mode theme
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Compact Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Use a more compact layout
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive important updates via email
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New User Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new users sign up
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">System Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Critical system notifications
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Information
              </CardTitle>
              <CardDescription>
                Backend and system configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">API Endpoint</p>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql'}
                  </code>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Environment</p>
                  <Badge variant="outline">
                    {import.meta.env.MODE}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Backend Health</p>
                  <p className="text-sm text-muted-foreground">
                    Check backend connectivity
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-green-600">Connected</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950 dark:border-red-900">
                <div>
                  <p className="font-medium text-red-600">Clear All Cache</p>
                  <p className="text-sm text-red-600/70">
                    Clear all cached data from the dashboard
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
