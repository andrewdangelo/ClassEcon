import { useState } from 'react';
import { Sparkles, Check, Rocket, Mail } from 'lucide-react';

export default function WaitlistPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'teacher',
    school: '',
    students: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with actual waitlist API
    console.log('Waitlist submission:', formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-primary-50 to-purple-50 flex items-center">
        <div className="container">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              You're On the List! 🎉
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for joining our waitlist! We'll be in touch soon with your early access invitation.
            </p>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 mb-6">
              <p className="font-semibold text-gray-900 mb-2">
                🎁 Your Founding Member Benefits:
              </p>
              <ul className="text-left space-y-2 text-gray-700">
                <li>• <strong>50% OFF lifetime pricing</strong></li>
                <li>• Early access to beta features</li>
                <li>• Priority customer support</li>
                <li>• Exclusive community access</li>
                <li>• Direct line to our product team</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">
              Check your email (<strong>{formData.email}</strong>) for next steps!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-primary-50 to-purple-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium mb-6 shadow-lg animate-pulse">
              <Sparkles className="w-4 h-4 mr-2" />
              Limited Spots Available - Act Fast!
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Join the
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent"> Classroom Revolution</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Be among the first 100 teachers to transform their classroom with ClassEcon and lock in <strong>50% OFF lifetime pricing</strong>!
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Benefits */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What You'll Get as a Founding Member
              </h2>
              <div className="space-y-4">
                {[
                  {
                    icon: Sparkles,
                    title: '50% OFF Lifetime',
                    description: 'Lock in founding member pricing forever - never pay full price!',
                  },
                  {
                    icon: Rocket,
                    title: 'Early Access',
                    description: 'Be the first to test new features before anyone else.',
                  },
                  {
                    icon: Mail,
                    title: 'Direct Communication',
                    description: 'Direct line to our founders - your feedback shapes the product!',
                  },
                  {
                    icon: Check,
                    title: 'Priority Support',
                    description: 'Get help first with dedicated founding member support.',
                  },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <benefit.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-bold text-gray-900 mb-1">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
                <p className="text-sm text-gray-700">
                  <strong>⏰ Limited Time Only!</strong> This offer expires when we reach 100 founding members or when we launch publicly - whichever comes first.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Join the Waitlist
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="john@school.edu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I am a *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="administrator">School Administrator</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School/Organization
                  </label>
                  <input
                    type="text"
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Lincoln Elementary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Students
                  </label>
                  <select
                    value={formData.students}
                    onChange={(e) => setFormData({ ...formData, students: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="1-15">1-15</option>
                    <option value="16-30">16-30</option>
                    <option value="31-50">31-50</option>
                    <option value="51+">51+</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Secure My Spot
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By joining, you agree to receive updates about ClassEcon. Unsubscribe anytime.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-gray-50">
        <div className="container text-center">
          <p className="text-lg text-gray-600 mb-6">
            Join <strong className="text-primary-600">500+ educators</strong> already on the waitlist
          </p>
          <div className="flex justify-center -space-x-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-purple-600 border-4 border-white flex items-center justify-center text-white font-bold"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
