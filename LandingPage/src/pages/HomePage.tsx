import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useSpring, useTrail, animated, config } from '@react-spring/web';
import { useInView } from 'react-intersection-observer';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  ClipboardCheck,
  ShoppingBag,
  Briefcase,
  BarChart3,
  Check,
  Sparkles,
  ArrowRight,
  GraduationCap,
  HeartHandshake,
  Clock,
  Building2,
  BookOpen,
  CreditCard,
} from 'lucide-react';

const platformPillars = [
  {
    icon: Briefcase,
    title: 'Classroom Reward System',
    description: 'Create structured rewards, consequences, and incentives that reinforce expectations and positive habits.',
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    icon: ShoppingBag,
    title: 'Behavior Meets Responsibility',
    description: 'Connect student choices to outcomes through jobs, store access, and spending decisions that require accountability.',
    gradient: 'from-violet-500 to-fuchsia-500',
  },
  {
    icon: BarChart3,
    title: 'Live Visibility',
    description: 'Teachers and students track balances, trends, and participation with real-time dashboards and activity history.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: ClipboardCheck,
    title: 'Easy Economic Management',
    description: 'Automate recurring pay and approvals so teachers can run a consistent system without extra admin burden.',
    gradient: 'from-amber-500 to-orange-500',
  },
];

const audienceCards = [
  {
    title: 'Students',
    description:
      'Practice responsibility through a consistent reward system where effort, choices, and follow-through all matter.',
    icon: GraduationCap,
    cta: 'Explore Student Experience',
    to: '/for-students',
    accent: 'from-sky-500 to-indigo-600',
    highlights: ['Earn rewards through actions', 'Track progress and choices', 'Build habits through consistency'],
  },
  {
    title: 'Teachers',
    description:
      'Run a clear classroom management system with incentives and economic tools that support behavior and engagement.',
    icon: Users,
    cta: 'Explore Teacher Tools',
    to: '/for-teachers',
    accent: 'from-emerald-500 to-teal-600',
    highlights: ['Set clear expectations', 'Reward positive behavior', 'Teach practical finance principles'],
  },
  {
    title: 'Parents',
    description:
      'See the responsibility skills your child is practicing and reinforce those habits with aligned language at home.',
    icon: HeartHandshake,
    cta: 'Join Parent Interest List',
    to: '/waitlist',
    accent: 'from-violet-500 to-pink-600',
    highlights: ['Visibility into classroom growth', 'Home-school alignment', 'Support for responsibility habits'],
  },
];

const launchChecklist = [
  {
    title: 'Set Up Your Classroom',
    description: 'Define classroom expectations, reward pathways, and economy settings in a guided setup flow.',
    icon: Building2,
  },
  {
    title: 'Activate Jobs and Store',
    description: 'Launch jobs, approvals, and store incentives that make positive behavior visible and meaningful.',
    icon: Briefcase,
  },
  {
    title: 'Guide Daily Participation',
    description: 'Students earn and spend daily while teachers coach responsibility, decision-making, and financial habits.',
    icon: BookOpen,
  },
  {
    title: 'Track Progress and Adjust',
    description: 'Use dashboards and transaction histories to reinforce growth and improve routines over time.',
    icon: TrendingUp,
  },
];

const trustPoints = [
  {
    title: 'Secure Billing and Access',
    description: 'Built with authenticated workflows, webhook validation, and managed subscription infrastructure.',
    icon: ShieldCheck,
  },
  {
    title: 'Teacher-Ready Onboarding',
    description: 'Clear getting-started guidance helps educators configure classes without technical overhead.',
    icon: Clock,
  },
  {
    title: 'Transparent Plans',
    description: 'Straightforward pricing options, billing portal support, and invoice visibility keep purchasing clear.',
    icon: CreditCard,
  },
];

function AnimatedSection({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
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
    from: { opacity: 0, transform: 'translateY(24px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: config.gentle,
  });

  const pillarTrail = useTrail(platformPillars.length, {
    from: { opacity: 0, transform: 'translateY(40px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: config.gentle,
  });

  return (
    <div className="min-h-screen overflow-hidden">
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-violet-50">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-16 left-16 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-32 right-16 w-72 h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-8 left-1/3 w-72 h-72 bg-fuchsia-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>
        </div>

        <div className="container relative z-10">
          <animated.div style={heroSpring} className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center px-5 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-semibold mb-8 border border-primary-200">
              Reward systems, responsibility, and practical economics in one platform
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-6 leading-tight">
              Build the classroom reward system
              <span className="block text-primary-700">that also teaches responsibility and economics.</span>
            </h1>

            <p className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
              ClassEcon helps teachers create a consistent incentive framework where students learn accountability,
              practice finance principles, and build real-world decision-making skills.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link
                to="/waitlist"
                className="group px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg flex items-center justify-center"
              >
                Join Early Access
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 bg-white text-gray-900 text-lg font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center"
              >
                View Plans
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              <div className="bg-white/90 border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-primary-700 mb-1">Student Impact</p>
                <p className="text-sm text-gray-700">Ownership grows when daily choices have clear outcomes.</p>
              </div>
              <div className="bg-white/90 border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-primary-700 mb-1">Teacher Efficiency</p>
                <p className="text-sm text-gray-700">Consistent systems and automation reduce behavior overhead.</p>
              </div>
              <div className="bg-white/90 border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-primary-700 mb-1">Family Alignment</p>
                <p className="text-sm text-gray-700">Shared language around responsibility, effort, and progress.</p>
              </div>
            </div>
          </animated.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container">
          <AnimatedSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
                Platform Highlights
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Every workflow is built to support behavior systems first, while naturally reinforcing finance and economic management.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillarTrail.map((style, index) => {
              const pillar = platformPillars[index];
              return (
                <animated.div
                  key={index}
                  style={style}
                  className="group relative bg-white rounded-2xl p-7 shadow-sm transition-all border border-gray-200 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}></div>

                  <div className={`w-12 h-12 bg-gradient-to-br ${pillar.gradient} rounded-xl flex items-center justify-center mb-5 shadow`}>
                    <pillar.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{pillar.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{pillar.description}</p>
                </animated.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="for-families" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <AnimatedSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
                Designed for Every Stakeholder
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                One platform, audience-specific experiences. Everyone sees what matters to their role.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {audienceCards.map((audience, index) => (
              <AnimatedSection key={audience.title} delay={index * 100}>
                <div className="h-full rounded-2xl border border-gray-200 bg-white p-7 shadow-sm hover:shadow-lg transition-shadow">
                  <div className={`inline-flex w-12 h-12 items-center justify-center rounded-xl bg-gradient-to-br ${audience.accent} mb-5`}>
                    <audience.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{audience.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-5">{audience.description}</p>
                  <ul className="space-y-2 mb-6">
                    {audience.highlights.map((item) => (
                      <li key={item} className="flex items-start text-sm text-gray-700">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link to={audience.to} className="inline-flex items-center text-primary-700 font-semibold hover:text-primary-800">
                    {audience.cta}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container">
          <AnimatedSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
                How ClassEcon Works
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                A practical sequence to launch your classroom economy and sustain student engagement.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {launchChecklist.map((step, index) => (
              <AnimatedSection key={step.title} delay={index * 75}>
                <div className="h-full rounded-2xl border border-gray-200 p-6 bg-gray-50/70">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center mb-4">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-700 mb-2">Step {index + 1}</p>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="container">
          <AnimatedSection>
            <div className="max-w-5xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
                Built on a Platform Schools Can Trust
              </h2>
              <p className="text-lg text-gray-600">
                ClassEcon aligns practical classroom workflows with secure infrastructure and transparent subscription management.
              </p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {trustPoints.map((point, index) => (
              <AnimatedSection key={point.title} delay={index * 80}>
                <div className="h-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="w-11 h-11 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center mb-4">
                    <point.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{point.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{point.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-primary-700 to-violet-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="container relative z-10 text-center">
          <AnimatedSection>
            <Sparkles className="w-14 h-14 mx-auto mb-5" />
            <h2 className="text-4xl md:text-5xl font-black mb-5">
              Turn Classroom Management Into Meaningful Growth
            </h2>
            <p className="text-lg text-violet-100 mb-9 max-w-3xl mx-auto leading-relaxed">
              Join early access to launch a consistent reward system that improves behavior while teaching finance principles and responsibility.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/waitlist"
                className="group px-8 py-4 bg-white text-primary-700 text-lg font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                Join the Waitlist
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 bg-transparent text-white text-lg font-semibold rounded-xl border border-white/40 hover:bg-white/10 transition-colors"
              >
                Talk With Our Team
              </Link>
            </div>
            <p className="mt-6 text-violet-100 text-sm">
              No credit card required for waitlist access. Early cohort includes educator onboarding support.
            </p>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
