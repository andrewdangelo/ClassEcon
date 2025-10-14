import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Award,
  Target,
  Bell,
  Star,
  Briefcase,
  ArrowRight,
  Check,
} from 'lucide-react';

export default function ForStudentsPage() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              <Award className="w-4 h-4 mr-2" />
              Built for Student Success
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Classroom,
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Your Economy</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Learn real money management skills while having fun. Earn, save, spend, and watch your success grow!
            </p>

            <Link
              to="/waitlist"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features that make learning about money fun and engaging
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Briefcase,
                title: 'Apply for Jobs',
                description: 'Browse available classroom jobs, submit applications, and start earning money for your work.',
                color: 'from-blue-500 to-blue-600',
              },
              {
                icon: DollarSign,
                title: 'Track Your Balance',
                description: 'See your account balance in real-time. Watch your money grow as you complete jobs and earn rewards.',
                color: 'from-green-500 to-green-600',
              },
              {
                icon: ShoppingBag,
                title: 'Shop for Rewards',
                description: 'Browse the classroom store and buy cool items, privileges, and rewards with your earned money.',
                color: 'from-purple-500 to-purple-600',
              },
              {
                icon: TrendingUp,
                title: 'View Your Activity',
                description: 'Track all your transactions - earnings, purchases, and balance changes in one easy-to-read dashboard.',
                color: 'from-orange-500 to-orange-600',
              },
              {
                icon: Target,
                title: 'Set Goals',
                description: 'Save up for that special item in the store. Track your progress and achieve your financial goals.',
                color: 'from-pink-500 to-pink-600',
              },
              {
                icon: Bell,
                title: 'Stay Updated',
                description: 'Get instant notifications when you earn money, when your job application is approved, and more.',
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

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Start earning and spending in just 3 simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: '1',
                  title: 'Get a Job',
                  description: 'Browse available classroom jobs and apply for the ones that interest you. Your teacher will review applications and assign positions.',
                  icon: Briefcase,
                },
                {
                  step: '2',
                  title: 'Earn Money',
                  description: 'Complete your job responsibilities, submit pay requests, and watch your balance grow. The more you do, the more you earn!',
                  icon: DollarSign,
                },
                {
                  step: '3',
                  title: 'Spend Wisely',
                  description: 'Visit the classroom store and buy rewards with your hard-earned money. Save up for bigger items or spend on smaller treats - you decide!',
                  icon: ShoppingBag,
                },
              ].map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {step.step}
                    </div>
                  </div>
                  <div className="ml-6 flex-1">
                    <div className="flex items-center mb-2">
                      <step.icon className="w-6 h-6 text-blue-600 mr-2" />
                      <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                    </div>
                    <p className="text-lg text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Real Skills for Real Life
            </h2>
            <p className="text-xl text-gray-600">
              Learn valuable financial lessons that will help you throughout your life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              'How to earn and manage money',
              'Making smart spending decisions',
              'Saving for goals you want to achieve',
              'Understanding income and expenses',
              'Taking responsibility for your actions',
              'Planning and budgeting basics',
              'The value of hard work',
              'Financial consequences and rewards',
            ].map((skill, index) => (
              <div key={index} className="flex items-start">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mr-3 mt-1" />
                <span className="text-lg text-gray-700">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Testimonial (Mock) */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <blockquote className="text-2xl font-medium text-gray-900 mb-6">
                "ClassEcon made learning about money so much fun! I love saving up for rewards and seeing my balance grow. It feels like a real job!"
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  S
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Sarah M.</div>
                  <div className="text-gray-600">5th Grade Student</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are learning valuable money skills while having fun!
          </p>
          <Link
            to="/waitlist"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
          >
            Join the Waitlist Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
