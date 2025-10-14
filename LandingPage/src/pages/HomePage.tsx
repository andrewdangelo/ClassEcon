import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Users,
  Award,
  ShoppingBag,
  Briefcase,
  BarChart3,
  Check,
  Sparkles,
  ArrowRight,
  Star,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-blue-50 to-purple-50 animate-gradient"></div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Early Access Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium mb-6 shadow-lg animate-pulse">
              <Sparkles className="w-4 h-4 mr-2" />
              Early Access - Limited Spots Available!
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your Classroom Into a
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent"> Living Economy</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Engage students with real-world financial literacy. Manage jobs, earnings, spending, and economic concepts in an interactive classroom environment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/waitlist"
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Join the Waitlist
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/for-teachers"
                className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center"
              >
                Learn More
              </Link>
            </div>

            {/* Special Offer */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 max-w-2xl mx-auto">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    🎉 Founding Member Special
                  </h3>
                  <p className="text-gray-700">
                    <strong>50% OFF lifetime</strong> + exclusive features for the first 100 teachers who join!
                    <br />
                    <span className="text-sm text-gray-600">Plus, get early access to beta features and priority support.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="container">
          <div className="text-center mb-8">
            <p className="text-gray-600 font-medium">Trusted by educators from</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            <div className="text-2xl font-bold text-gray-400">School District A</div>
            <div className="text-2xl font-bold text-gray-400">Academy B</div>
            <div className="text-2xl font-bold text-gray-400">Institute C</div>
            <div className="text-2xl font-bold text-gray-400">School D</div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for a Thriving Classroom Economy
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools that make financial education engaging and effective
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Briefcase,
                title: 'Job System',
                description: 'Students apply for classroom jobs, earn salaries, and learn responsibility.',
              },
              {
                icon: ShoppingBag,
                title: 'Classroom Store',
                description: 'Create a virtual store where students spend their earnings on rewards and items.',
              },
              {
                icon: TrendingUp,
                title: 'Balance Tracking',
                description: 'Real-time balance management with detailed transaction history.',
              },
              {
                icon: DollarSign,
                title: 'Fine System',
                description: 'Teach consequences with a fair and transparent fine management system.',
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                description: 'Track class economy health, student progress, and engagement metrics.',
              },
              {
                icon: Users,
                title: 'Student Engagement',
                description: 'Notifications, leaderboards, and gamification keep students motivated.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Students/Teachers Split */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Students */}
            <Link
              to="/for-students"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white hover:scale-105 transition-transform shadow-xl"
            >
              <div className="relative z-10">
                <Award className="w-12 h-12 mb-4" />
                <h3 className="text-3xl font-bold mb-4">For Students</h3>
                <p className="text-blue-100 mb-6">
                  Earn money, manage your budget, shop for rewards, and learn real financial skills in a fun, interactive way.
                </p>
                <div className="flex items-center text-white font-semibold">
                  Explore Student Features
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>

            {/* For Teachers */}
            <Link
              to="/for-teachers"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white hover:scale-105 transition-transform shadow-xl"
            >
              <div className="relative z-10">
                <Users className="w-12 h-12 mb-4" />
                <h3 className="text-3xl font-bold mb-4">For Teachers</h3>
                <p className="text-emerald-100 mb-6">
                  Effortlessly manage your classroom economy. Track student progress, customize settings, and focus on teaching.
                </p>
                <div className="flex items-center text-white font-semibold">
                  Explore Teacher Features
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-purple-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Teachers Love ClassEcon
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              'Increases student engagement and motivation',
              'Teaches real-world financial literacy',
              'Easy to set up and manage',
              'Customizable to fit your classroom',
              'Reduces classroom management issues',
              'Promotes responsibility and accountability',
              'Data-driven insights on student behavior',
              'Aligns with financial education standards',
            ].map((benefit, index) => (
              <div key={index} className="flex items-start">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mr-3 mt-1" />
                <span className="text-lg text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Classroom?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of educators who are revolutionizing how students learn about money and economics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/waitlist"
              className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
            >
              Join the Waitlist - It's Free!
            </Link>
            <Link
              to="/pricing"
              className="px-8 py-4 bg-primary-700 text-white font-semibold rounded-lg border-2 border-white hover:bg-primary-800 transition-all"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
