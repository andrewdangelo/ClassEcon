// src/pages/GettingStartedPage.tsx
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Briefcase, 
  Store, 
  DollarSign, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function GettingStartedPage() {
  const steps = [
    {
      number: 1,
      title: 'Create Your First Class',
      description: 'Set up your classroom economy with a custom name and currency.',
      icon: BookOpen,
      link: '/classes/new',
      linkText: 'Create Class',
      details: [
        'Choose a unique class name and slug',
        'Set your currency name (e.g., "Dollars", "Eagles", "Points")',
        'Customize starting balance for new students',
      ],
    },
    {
      number: 2,
      title: 'Add Students',
      description: 'Invite students to join your classroom economy.',
      icon: Users,
      link: '/students',
      linkText: 'Manage Students',
      details: [
        'Share your class join code with students',
        'Or manually add students yourself',
        'Each student gets their own account with starting balance',
      ],
    },
    {
      number: 3,
      title: 'Set Up Jobs',
      description: 'Create jobs that students can apply for and earn money.',
      icon: Briefcase,
      link: '/jobs',
      linkText: 'Create Jobs',
      details: [
        'Define job titles and descriptions',
        'Set salary amounts (fixed or hourly)',
        'Choose how often students get paid',
      ],
    },
    {
      number: 4,
      title: 'Create a Store',
      description: 'Add items students can purchase with their earnings.',
      icon: Store,
      link: '/store',
      linkText: 'Set Up Store',
      details: [
        'Add privileges, supplies, or experiences',
        'Set prices and stock quantities',
        'Students can redeem their purchases',
      ],
    },
    {
      number: 5,
      title: 'Manage Finances',
      description: 'Track transactions, approve pay requests, and manage fines.',
      icon: DollarSign,
      link: '/requests',
      linkText: 'View Transactions',
      details: [
        'Review and approve student pay requests',
        'Issue fines for infractions',
        'Track all financial activity',
      ],
    },
    {
      number: 6,
      title: 'Monitor Progress',
      description: 'Use analytics to track student engagement and economy health.',
      icon: TrendingUp,
      link: '/classes',
      linkText: 'View Analytics',
      details: [
        'See top earners and spenders',
        'Track job participation rates',
        'Monitor store sales and trends',
      ],
    },
  ];

  return (
    <div className="page-stack pb-16">
      <div className="marketing-hero text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Getting started with ClassEcon
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Follow these steps to set up your classroom economy and start teaching financial literacy through hands-on
          experience.
        </p>
      </div>

      <div className="mx-auto w-full max-w-4xl">
        {/* Quick Start */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              <CardTitle>Quick Start</CardTitle>
            </div>
            <CardDescription>
              New to ClassEcon? Start here for the fastest path to getting your classroom economy running.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1">
                <Link to="/classes/new">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Create Your First Class
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/onboarding">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Watch Tutorial Videos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step-by-Step Guide */}
        <div className="flex flex-col gap-6">
          <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Step-by-step guide</h2>
          
          {steps.map((step, index) => (
            <Card key={step.number} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shrink-0">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <step.icon className="h-5 w-5" />
                      {step.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {step.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-2 mb-4">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" size="sm">
                  <Link to={step.link}>
                    {step.linkText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-12" />

        {/* Additional Resources */}
        <div className="flex flex-col gap-6">
          <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Additional resources</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Video Tutorials</CardTitle>
                <CardDescription>
                  Watch step-by-step video guides for each feature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/onboarding">Watch Tutorials</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best Practices</CardTitle>
                <CardDescription>
                  Learn tips from experienced ClassEcon teachers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/getting-started">Read Guide</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">FAQs</CardTitle>
                <CardDescription>
                  Find answers to commonly asked questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/settings">View FAQs</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Support</CardTitle>
                <CardDescription>
                  Need help? Our support team is here for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/settings">Get Support</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link to="/">
              Back to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
