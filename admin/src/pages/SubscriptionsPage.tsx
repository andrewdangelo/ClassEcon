import { useQuery } from '@apollo/client'
import { GET_AVAILABLE_PLANS, GET_MY_SUBSCRIPTION } from '@/graphql/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, X, CreditCard, Users, Star } from 'lucide-react'

interface PlanInfo {
  tier: string
  name: string
  price: number
  billingPeriod: string
  features: string[]
  stripePriceId: string
  limits: {
    maxClasses: number | null
    maxStudentsPerClass: number | null
    maxStoreItems: number | null
    maxJobs: number | null
    customCurrency: boolean
    analytics: boolean
    exportData: boolean
    prioritySupport: boolean
  }
}

export function SubscriptionsPage() {
  const { data: plansData, loading: plansLoading } = useQuery(GET_AVAILABLE_PLANS)
  const { data: mySubData, loading: mySubLoading } = useQuery(GET_MY_SUBSCRIPTION)

  const plans: PlanInfo[] = plansData?.availablePlans || []
  const mySubscription = mySubData?.mySubscription

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return <Badge variant="secondary">Free</Badge>
      case 'TRIAL':
        return <Badge variant="warning">Trial</Badge>
      case 'STARTER':
        return <Badge variant="default">Starter</Badge>
      case 'PROFESSIONAL':
        return <Badge className="bg-purple-500">Professional</Badge>
      case 'SCHOOL':
        return <Badge className="bg-blue-500">School</Badge>
      default:
        return <Badge>{tier}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>
      case 'TRIALING':
        return <Badge variant="warning">Trialing</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'PAST_DUE':
        return <Badge variant="destructive">Past Due</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">
          View subscription plans and manage user subscriptions
        </p>
      </div>

      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">Available Plans</TabsTrigger>
          <TabsTrigger value="my-subscription">My Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          {/* Plans Overview */}
          {plansLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading plans...</div>
          ) : plans.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No plans available
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => (
                <Card key={plan.tier} className="relative">
                  {plan.tier === 'PROFESSIONAL' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-purple-500">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.name}
                      {getTierBadge(plan.tier)}
                    </CardTitle>
                    <CardDescription>
                      <span className="text-2xl font-bold">${plan.price}</span>
                      {plan.price > 0 && <span className="text-sm">/{plan.billingPeriod}</span>}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>
                          {plan.limits.maxClasses
                            ? `${plan.limits.maxClasses} classes`
                            : 'Unlimited classes'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>
                          {plan.limits.maxStudentsPerClass
                            ? `${plan.limits.maxStudentsPerClass} students/class`
                            : 'Unlimited students'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {plan.limits.analytics ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>Analytics</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {plan.limits.customCurrency ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>Custom currency</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {plan.limits.prioritySupport ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>Priority support</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Plans Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Comparison</CardTitle>
              <CardDescription>
                Compare features across all subscription tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {plans.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      {plans.map((plan) => (
                        <TableHead key={plan.tier} className="text-center">
                          {plan.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Max Classes</TableCell>
                      {plans.map((plan) => (
                        <TableCell key={plan.tier} className="text-center">
                          {plan.limits.maxClasses || '∞'}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Students per Class</TableCell>
                      {plans.map((plan) => (
                        <TableCell key={plan.tier} className="text-center">
                          {plan.limits.maxStudentsPerClass || '∞'}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Store Items</TableCell>
                      {plans.map((plan) => (
                        <TableCell key={plan.tier} className="text-center">
                          {plan.limits.maxStoreItems || '∞'}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Jobs</TableCell>
                      {plans.map((plan) => (
                        <TableCell key={plan.tier} className="text-center">
                          {plan.limits.maxJobs || '∞'}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Analytics</TableCell>
                      {plans.map((plan) => (
                        <TableCell key={plan.tier} className="text-center">
                          {plan.limits.analytics ? (
                            <Check className="h-4 w-4 mx-auto text-green-500" />
                          ) : (
                            <X className="h-4 w-4 mx-auto text-muted-foreground" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Export Data</TableCell>
                      {plans.map((plan) => (
                        <TableCell key={plan.tier} className="text-center">
                          {plan.limits.exportData ? (
                            <Check className="h-4 w-4 mx-auto text-green-500" />
                          ) : (
                            <X className="h-4 w-4 mx-auto text-muted-foreground" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Your Subscription
              </CardTitle>
              <CardDescription>
                Your current subscription details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mySubLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : !mySubscription ? (
                <div className="text-center py-4 text-muted-foreground">
                  No subscription found
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Plan</p>
                      <p className="font-medium">{getTierBadge(mySubscription.planTier)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <p>{getStatusBadge(mySubscription.status)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Current Period</p>
                      <p className="text-sm">
                        {mySubscription.currentPeriodStart && mySubscription.currentPeriodEnd
                          ? `${new Date(mySubscription.currentPeriodStart).toLocaleDateString()} - ${new Date(mySubscription.currentPeriodEnd).toLocaleDateString()}`
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cancel at Period End</p>
                      <p>{mySubscription.cancelAtPeriodEnd ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
