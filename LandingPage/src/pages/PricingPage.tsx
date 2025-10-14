import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: '$9',
      period: '/month',
      description: 'Perfect for individual teachers just getting started',
      features: [
        'Up to 30 students',
        '1 classroom',
        'Basic job system',
        'Classroom store',
        'Transaction tracking',
        'Email support',
      ],
      cta: 'Start Free Trial',
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$19',
      period: '/month',
      description: 'Best for teachers who want the full experience',
      features: [
        'Unlimited students',
        'Up to 5 classrooms',
        'Advanced job system',
        'Custom store items',
        'Analytics dashboard',
        'Fine management',
        'Priority support',
        'Custom currency names',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
      badge: 'Most Popular',
    },
    {
      name: 'School',
      price: 'Custom',
      period: '',
      description: 'For schools and districts with multiple teachers',
      features: [
        'Unlimited classrooms',
        'Unlimited students',
        'All Professional features',
        'Admin dashboard',
        'Bulk student management',
        'Training sessions',
        'Dedicated support',
        'Custom integrations',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-primary-50 to-purple-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Choose the plan that's right for you. All plans include a 14-day free trial, no credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Founding Member Special */}
      <section className="py-12 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 mr-2" />
              <h2 className="text-3xl font-bold">Founding Member Special</h2>
            </div>
            <p className="text-xl mb-2">
              <strong>50% OFF LIFETIME</strong> for the first 100 teachers who join!
            </p>
            <p className="text-amber-100">
              Lock in these prices forever + get exclusive early access to new features
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-primary-600 to-purple-600 text-white shadow-2xl scale-105'
                    : 'bg-white border-2 border-gray-200 shadow-lg'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-amber-500 text-white text-sm font-bold rounded-full">
                    {plan.badge}
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-xl ml-1 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`text-sm ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className={`w-5 h-5 flex-shrink-0 mr-3 ${plan.highlighted ? 'text-blue-200' : 'text-green-500'}`} />
                      <span className={`text-sm ${plan.highlighted ? 'text-blue-50' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/waitlist"
                  className={`w-full block text-center px-6 py-3 rounded-lg font-semibold transition-all ${
                    plan.highlighted
                      ? 'bg-white text-primary-600 hover:bg-gray-100'
                      : 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-700 hover:to-purple-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: 'Is there really a free trial?',
                a: 'Yes! All plans come with a 14-day free trial, and you don\'t need to enter a credit card to get started.',
              },
              {
                q: 'What happens after my trial ends?',
                a: 'After your trial, you can choose to upgrade to a paid plan. Your data will be saved, so you can pick up right where you left off.',
              },
              {
                q: 'Can I switch plans later?',
                a: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.',
              },
              {
                q: 'Do you offer discounts for schools?',
                a: 'Yes! We offer special pricing for schools and districts with multiple teachers. Contact us for a custom quote.',
              },
              {
                q: 'Is my data secure?',
                a: 'Yes, we take security seriously. All data is encrypted, backed up daily, and stored on secure servers.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-4">
            Still Have Questions?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Our team is here to help you choose the right plan for your classroom.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              Contact Us
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/waitlist"
              className="inline-flex items-center px-8 py-4 bg-primary-700 text-white font-semibold rounded-lg border-2 border-white hover:bg-primary-800 transition-all"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
