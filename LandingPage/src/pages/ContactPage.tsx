import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with actual contact API
    console.log('Contact submission:', formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-primary-50 to-purple-50 flex items-center">
        <div className="container">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Message Received! ✉️
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for reaching out! We'll get back to you within 24 hours.
            </p>
            <p className="text-sm text-gray-600">
              We sent a confirmation to <strong>{formData.email}</strong>
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all"
            >
              Send Another Message
            </button>
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
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <p className="text-gray-600">
                  Reach out to us through any of these channels, or fill out the form and we'll get back to you shortly.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <a href="mailto:hello@classecon.com" className="text-primary-600 hover:text-primary-700">
                      hello@classecon.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                    <a href="tel:+15551234567" className="text-primary-600 hover:text-primary-700">
                      (555) 123-4567
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Office</h4>
                    <p className="text-gray-600">
                      123 Education Lane<br />
                      San Francisco, CA 94102
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Quick Links */}
              <div className="pt-8 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="/pricing" className="text-primary-600 hover:text-primary-700 text-sm">
                      View Pricing Plans →
                    </a>
                  </li>
                  <li>
                    <a href="/waitlist" className="text-primary-600 hover:text-primary-700 text-sm">
                      Join the Waitlist →
                    </a>
                  </li>
                  <li>
                    <a href="/for-teachers" className="text-primary-600 hover:text-primary-700 text-sm">
                      Teacher Features →
                    </a>
                  </li>
                  <li>
                    <a href="/for-students" className="text-primary-600 hover:text-primary-700 text-sm">
                      Student Features →
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
                <div className="flex items-center mb-6">
                  <MessageSquare className="w-8 h-8 text-primary-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    Send Us a Message
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select a subject...</option>
                      <option value="general">General Inquiry</option>
                      <option value="demo">Request a Demo</option>
                      <option value="pricing">Pricing Questions</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="feedback">Product Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    We typically respond within 24 hours during business days.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Support Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  question: 'When will ClassEcon be available?',
                  answer: "We're launching soon! Join our waitlist to be among the first to access the platform.",
                },
                {
                  question: 'Is there a free trial?',
                  answer: 'Yes! All plans include a 30-day free trial with full access to all features.',
                },
                {
                  question: 'Can I switch plans later?',
                  answer: 'Absolutely! You can upgrade or downgrade your plan at any time from your account settings.',
                },
                {
                  question: 'Do you offer training?',
                  answer: 'Yes, we provide comprehensive onboarding and training resources for all teachers.',
                },
              ].map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
