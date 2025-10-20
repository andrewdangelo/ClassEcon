import { Link } from 'react-router-dom';
import { useSpring, useTrail, animated, config } from '@react-spring/web';
import { useInView } from 'react-intersection-observer';
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
  Zap,
  Target,
  Coins,
  GraduationCap,
} from 'lucide-react';

const features = [
  {
    icon: Briefcase,
    title: 'Classroom Jobs',
    description: 'Students compete for real roles with real rewards. Watch them take ownership like never before.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: ShoppingBag,
    title: 'Virtual Store',
    description: 'Transform learning into earning. Students shop, budget, and make choices that matter.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: TrendingUp,
    title: 'Live Economy',
    description: 'Real-time balances that respond to real actions. Economics becomes tangible, not theoretical.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Coins,
    title: 'Smart Transactions',
    description: 'Every dollar has a story. Track income, expenses, and watch financial literacy bloom.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'Insights That Matter',
    description: 'See what works. Data-driven dashboards reveal patterns you never knew existed.',
    gradient: 'from-red-500 to-pink-500',
  },
  {
    icon: Target,
    title: 'Engagement Supercharged',
    description: 'Leaderboards, achievements, and rewards. Students don\'t just participate—they compete to excel.',
    gradient: 'from-indigo-500 to-purple-500',
  },
];

const benefits = [
  'Skyrocket student engagement overnight',
  'Financial literacy that actually sticks',
  'Setup in minutes, not hours',
  'Customize everything to your style',
  'Classroom management on autopilot',
  'Accountability built into the DNA',
  'See what\'s working with real data',
  'Standards-aligned, teacher-approved',
];

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const spring = useSpring({
    from: { opacity: 0, transform: 'translateY(50px)' },
    to: {
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0px)' : 'translateY(50px)',
    },
    delay,
    config: config.gentle,
  });

  return (
    <animated.div ref={ref} style={spring}>
      {children}
    </animated.div>
  );
}

export default function HomePage() {
  const heroSpring = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: config.slow,
  });

  const trail = useTrail(features.length, {
    from: { opacity: 0, transform: 'translateY(40px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: config.gentle,
  });

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>
        </div>
        
        <div className="container relative z-10">
          <animated.div style={heroSpring} className="max-w-5xl mx-auto text-center">
            {/* Beta Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-bold mb-8 shadow-2xl hover:shadow-violet-500/50 transition-shadow cursor-default">
              <Zap className="w-4 h-4 mr-2 animate-pulse" />
              EARLY ACCESS — LIMITED BETA SPOTS
            </div>

            <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-8 leading-tight">
              Your Classroom.
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                A Living Economy.
              </span>
            </h1>
            
            <p className="text-2xl text-gray-700 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Stop teaching financial literacy from a textbook. 
              <span className="text-violet-600 font-bold"> Make it real.</span> 
              {' '}Students earn, spend, save, and learn—all within your classroom.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link
                to="/waitlist"
                className="group px-10 py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-lg font-bold rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-2xl hover:shadow-violet-500/50 hover:scale-105 flex items-center justify-center"
              >
                Get Early Access
                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link
                to="/for-teachers"
                className="px-10 py-5 bg-white text-violet-700 text-lg font-bold rounded-xl border-3 border-violet-300 hover:bg-violet-50 transition-all shadow-xl hover:scale-105 flex items-center justify-center"
              >
                See It In Action
              </Link>
            </div>

            {/* Special Offer */}
            <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 border-3 border-amber-300 rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl hover:shadow-amber-200 transition-shadow">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  🎉 FOUNDING MEMBER BONUS
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-gray-900 mb-3">
                  50% OFF For Life + Exclusive Perks
                </div>
                <p className="text-gray-700 text-lg">
                  First 100 teachers lock in <span className="font-bold text-amber-600">lifetime pricing</span> + 
                  priority support + early feature access. No tricks, just rewards for being early.
                </p>
              </div>
            </div>
          </animated.div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24 bg-white">
        <div className="container">
          <AnimatedSection>
            <div className="text-center mb-20">
              <h2 className="text-5xl font-black text-gray-900 mb-6">
                Not Just Another Ed-Tech Tool
              </h2>
              <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
                This is the classroom economy platform built by teachers who get it. 
                Every feature solves a real problem.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trail.map((style, index) => {
              const feature = features[index];
              return (
                <animated.div
                  key={index}
                  style={style}
                  className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:border-transparent hover:-translate-y-2"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}></div>
                  
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
                </animated.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* For Students/Teachers Split */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-gray-900 mb-4">
                Built For Both Sides of the Desk
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* For Students */}
            <AnimatedSection delay={100}>
              <Link
                to="/for-students"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 text-white hover:scale-105 transition-all shadow-2xl hover:shadow-purple-500/50 h-full flex flex-col justify-between min-h-[400px]"
              >
                <div className="relative z-10">
                  <GraduationCap className="w-16 h-16 mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-4xl font-black mb-6">For Students</h3>
                  <p className="text-blue-50 text-xl mb-8 leading-relaxed">
                    This isn't school—it's your economy. Earn real money (well, classroom money). 
                    Build your empire. Make choices that matter. Learn what adults wish they knew at your age.
                  </p>
                  <div className="flex items-center text-white font-bold text-lg">
                    Discover Your Economy
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-3 transition-transform" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            </AnimatedSection>

            {/* For Teachers */}
            <AnimatedSection delay={200}>
              <Link
                to="/for-teachers"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-12 text-white hover:scale-105 transition-all shadow-2xl hover:shadow-emerald-500/50 h-full flex flex-col justify-between min-h-[400px]"
              >
                <div className="relative z-10">
                  <Users className="w-16 h-16 mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-4xl font-black mb-6">For Teachers</h3>
                  <p className="text-emerald-50 text-xl mb-8 leading-relaxed">
                    Stop fighting for attention. ClassEcon does the heavy lifting. 
                    Students stay engaged, behavior improves, and you actually get to teach. 
                    It's like having a TA who never calls in sick.
                  </p>
                  <div className="flex items-center text-white font-bold text-lg">
                    See Teacher Tools
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-3 transition-transform" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-white">
        <div className="container">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-gray-900 mb-6">
                Why Teachers Can't Stop Talking About It
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Real results from real classrooms. These aren't promises—they're patterns.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <AnimatedSection key={index} delay={index * 50}>
                <div className="flex items-start group hover:bg-gradient-to-r hover:from-violet-50 hover:to-fuchsia-50 p-4 rounded-xl transition-all">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <Check className="w-5 h-5 text-white stroke-[3]" />
                  </div>
                  <span className="text-xl text-gray-700 font-medium leading-relaxed">{benefit}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="container text-center relative z-10">
          <AnimatedSection>
            <Sparkles className="w-16 h-16 mx-auto mb-6 animate-pulse" />
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Ready to Change Everything?
            </h2>
            <p className="text-2xl text-purple-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join the movement of educators who aren't just teaching about money—
              they're creating financial geniuses, one classroom at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/waitlist"
                className="group px-12 py-6 bg-white text-violet-700 text-xl font-black rounded-xl hover:bg-gray-100 transition-all shadow-2xl hover:shadow-white/50 hover:scale-105"
              >
                Claim Your Spot Now
                <span className="inline-block ml-2 group-hover:translate-x-2 transition-transform">→</span>
              </Link>
              <Link
                to="/pricing"
                className="px-12 py-6 bg-violet-800/50 backdrop-blur text-white text-xl font-black rounded-xl border-3 border-white/30 hover:bg-violet-800/70 transition-all hover:scale-105"
              >
                See Pricing
              </Link>
            </div>
            <p className="mt-8 text-purple-200 text-sm">
              🔒 No credit card required • 🎯 Cancel anytime • ✨ 50+ teachers already in
            </p>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
