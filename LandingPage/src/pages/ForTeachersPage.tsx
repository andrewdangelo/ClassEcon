import { Link } from 'react-router-dom';
import {
  Users,
  BarChart3,
  Settings,
  Clock,
  Shield,
  Zap,
  Check,
  Star,
  ArrowRight,
  Briefcase,
  ShoppingBag,
  DollarSign,
} from 'lucide-react';

export default function ForTeachersPage() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
              <Users className="w-4 h-4 mr-2" />
              Designed for Educators
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Manage Your Classroom Economy
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> Effortlessly</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Spend less time on administrative tasks and more time teaching. Our platform handles the economics, you handle the education.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/waitlist"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center px-8 py-4 bg-white text-emerald-600 font-semibold rounded-lg border-2 border-emerald-600 hover:bg-emerald-50 transition-all"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive tools to run a successful classroom economy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Briefcase,
                title: 'Job Management',
                description: 'Create classroom jobs, set salaries, review applications, and manage employments with ease.',
                color: 'from-blue-500 to-blue-600',
              },
              {
                icon: ShoppingBag,
                title: 'Store Management',
                description: 'Set up your classroom store, manage inventory, track purchases, and handle redemptions.',
                color: 'from-purple-500 to-purple-600',
              },
              {
                icon: DollarSign,
                title: 'Payment Processing',
                description: 'Review pay requests, approve payroll, issue bonuses, and manage fines all in one place.',
                color: 'from-green-500 to-green-600',
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                description: 'Track class economy health, student engagement, spending patterns, and more with detailed analytics.',
                color: 'from-orange-500 to-orange-600',
              },
              {
                icon: Users,
                title: 'Student Profiles',
                description: 'View detailed student profiles with transaction history, balance, jobs, and behavioral insights.',
                color: 'from-pink-500 to-pink-600',
              },
              {
                icon: Settings,
                title: 'Customization',
                description: 'Customize currency names, set your own rules, adjust settings to match your teaching style.',
                color: 'from-indigo-500 to-indigo-600',
              },
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Save Time, Increase Engagement
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                ClassEcon automates the tedious parts of running a classroom economy, giving you more time to focus on what matters most - teaching your students.
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: Clock,
                    title: 'Save 5+ Hours Per Week',
                    description: 'Automate payroll, tracking, and record-keeping tasks.',
                  },
                  {
                    icon: Zap,
                    title: 'Instant Updates',
                    description: 'Students see changes in real-time, reducing questions and confusion.',
                  },
                  {
                    icon: Shield,
                    title: 'Secure & Reliable',
                    description: 'Your data is encrypted and backed up automatically.',
                  },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <benefit.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-bold text-gray-900 mb-1">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What Teachers Say</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-2">
                    "This platform has transformed my classroom! Students are more engaged and I save so much time on administrative tasks."
                  </p>
                  <p className="text-sm text-gray-600">- Mrs. Johnson, 4th Grade</p>
                </div>
                <div>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-2">
                    "My students actually look forward to managing their money! The analytics help me understand each student better."
                  </p>
                  <p className="text-sm text-gray-600">- Mr. Davis, 5th Grade</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Setup Process */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600">
              Simple setup process that won't take away from your teaching time
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Create Account', description: 'Sign up and create your first classroom' },
                { step: '2', title: 'Invite Students', description: 'Send invitation links or codes to your students' },
                { step: '3', title: 'Customize Settings', description: 'Set up your currency, jobs, and store items' },
                { step: '4', title: 'Start Teaching', description: 'Launch your classroom economy and watch engagement soar' },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Teachers Choose ClassEcon
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              'Built by educators, for educators',
              'No technical expertise required',
              'Works on any device - desktop, tablet, or phone',
              'Automatic backups and data security',
              'Dedicated customer support team',
              'Regular updates and new features',
              'Aligns with financial literacy standards',
              'Free training and onboarding resources',
            ].map((reason, index) => (
              <div key={index} className="flex items-start bg-white rounded-lg p-4 shadow-sm">
                <Check className="w-6 h-6 text-emerald-500 flex-shrink-0 mr-3 mt-1" />
                <span className="text-lg text-gray-700">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Classroom?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of teachers who are using ClassEcon to teach financial literacy in an engaging way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/waitlist"
              className="inline-flex items-center px-8 py-4 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 bg-emerald-700 text-white font-semibold rounded-lg border-2 border-white hover:bg-emerald-800 transition-all"
            >
              Schedule a Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
